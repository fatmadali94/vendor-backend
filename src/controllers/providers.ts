import express from "express";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../db/users";
import Provider, { getVerifiedProviderById } from "../db/providers";
import crypto from "crypto";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./emailService";
import UnverifiedProvider from "../db/unverifiedProviders";
import {
  hashPassword,
  generateToken,
  validatePassword,
} from "../utils/helpers";
import cloudinary from "../utils/cloudinary";
import { sendSms } from "./smsService";

dotenv.config();


export const uploadProviderFile = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { file, providerId, originalFilename } = req.body;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    if (!providerId) {
      return res.status(400).json({ message: "Provider ID is required" });
    }

    const fileSizeInBytes = Buffer.byteLength(file, "utf-8");
    const maxSizeInBytes = 10 * 1024 * 1024; // ✅ 10MB Limit

    if (fileSizeInBytes > maxSizeInBytes) {
      return res.status(400).json({ message: "File size exceeds 10MB limit" });
    }

    const fileType = file.split(";")[0].split("/")[1].toLowerCase();

    let uploadOptions: {
      folder: string;
      resource_type?: "image" | "video" | "raw" | "auto";
    } = {
      folder: `provider_uploads/${providerId}`,
    };

    if (fileType === "pdf") {
      uploadOptions.resource_type = "raw";
    }

    // ✅ Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file, uploadOptions);

    // ✅ Find provider in DB
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // ✅ Create file object
    const newFile = {
      public_id: result.public_id,
      url: result.secure_url,
      filename: result.original_filename,
      fileType,
      originalFilename,
    };

    // ✅ Add to uploadedFiles array
    provider.uploadedFiles = provider.uploadedFiles || [];
    provider.uploadedFiles.push(newFile);
    await provider.save();

    res.status(200).json({
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};


export const getAllProviders = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const providers = await Provider.find();
    return res.status(200).json(providers);
  } catch (error) {
    return res.sendStatus(400);
  }
};

export const registerProvider = async (req: any, res: any) => {
  const data = req.body;

  try {
    // Build records and remove empties
    const processedRecords = (data.records || [])
      .map((record: any) => {
        if (record.materialgroup || record.materialname || record.materialgrade) {
          return {
            materialgroup: record.materialgroup,
            materialname: record.materialname,
            materialgrade: record.materialgrade,
          };
        }
        if (record.partgroup || record.partname || record.partgeneralid) {
          return {
            partgroup: record.partgroup,
            partname: record.partname,
            partgeneralid: record.partgeneralid,
          };
        }
        return null;
      })
      .filter(Boolean);

    const verificationCode = crypto.randomBytes(3).toString("hex");
    const hashedPassword = await hashPassword(data.password);

    let imagePayload: any = undefined;
    if (req.body?.image) {
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: "verifiedProviders",
      });
      imagePayload = { public_id: result.public_id, url: result.secure_url };
    }

    const unverifiedProvider = new UnverifiedProvider({
      ...data,
      records: processedRecords,
      password: hashedPassword,
      verificationCode,
      ...(imagePayload ? { image: imagePayload } : {}),
    });

    await unverifiedProvider.save();

    // Email is required for verification; fail early if it errors
    await sendVerificationEmail(unverifiedProvider.email, verificationCode);

    // Try SMS but don't fail the whole request if it errors
    let smsSent = false;
    if (unverifiedProvider.cellphone) {
      const smsText = `کد تایید شما: ${verificationCode}`;
      try {
        console.log(`📱 Sending SMS to ${unverifiedProvider.cellphone}: ${smsText}`);
        await sendSms(unverifiedProvider.cellphone, smsText);
        smsSent = true;
        console.log("✅ SMS sent successfully");
      } catch (err: any) {
        console.error("❌ Error sending SMS:", err?.message || err);
      }
    }

    const message = smsSent
      ? "Verification email and SMS sent"
      : "Verification email sent";

    return res.status(201).json({ message }); // ✅ single response + return
  } catch (error: any) {
    // Make sure to return here too
    return res.status(400).json({ message: error?.message || "Something went wrong" });
  }
};

export const verifyProvider = async (req: any, res: any) => {
  const { email, code } = req.body;
  try {
    const unverifiedProvider = await UnverifiedProvider.findOne({
      email,
      verificationCode: code,
    });
    if (!unverifiedProvider) {
      return res.status(400).json({ message: "کد ورودی اشتباه می باشد" });
    }
    const { verificationCode, ...providerData } = unverifiedProvider.toObject();

    const provider = new Provider(providerData);
    await provider.save();

    // Remove the unverified provider from the UnverifiedUser collection
    await UnverifiedProvider.deleteOne({ email: unverifiedProvider.email });
    await sendWelcomeEmail(provider.email);
    const token = generateToken(provider._id);
    res.status(200).json({ token, provider });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeUnverifiedProvider = async (req: any, res: any) => {
  const { email } = req.body;
  try {
    const unverifiedProvider = await UnverifiedProvider.findOne({ email });
    if (!unverifiedProvider) {
      return res.status(404).json({ message: "User not found" });
    }
    await UnverifiedProvider.deleteOne({ email: unverifiedProvider.email });
    res.status(200).json({ message: "Verification code resent" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginProvider = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const provider = await Provider.findOne({ email });
    if (!provider || !validatePassword(password, provider.password)) {
      return res
        .status(401)
        .json({ message: "نام کاربری یا رمز عبور اشتباه است" });
    }
    const token = generateToken(provider._id);
    res.status(200).json({
      message: "Login successful",
      token,
      provider: {
        id: provider._id,
        email: provider.email,
        name: provider.company_name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resendProviderVerificationCode = async (req: any, res: any) => {
  const { email } = req.body;
  try {
    const unverifiedProvider = await UnverifiedProvider.findOne({ email });
    if (!unverifiedProvider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const verificationCode = crypto.randomBytes(3).toString("hex");
    unverifiedProvider.verificationCode = verificationCode;
    await unverifiedProvider.save();

    await sendVerificationEmail(unverifiedProvider.email, verificationCode);

    res.status(200).json({ message: "Verification code resent" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const providerForgotPassword = async (req: any, res: any) => {
  const { email } = req.body;

  try {
    const provider = await Provider.findOne({ email });
    if (!provider) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    provider.resetPasswordToken = resetToken;
    provider.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await provider.save();

    await sendPasswordResetEmail(provider.email, resetToken);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const providerResetPassword = async (req: any, res: any) => {
  const { token, newPassword } = req.body;

  try {
    const provider: any = await Provider.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!provider) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    provider.password = hashPassword(newPassword);
    provider.resetPasswordToken = undefined;
    provider.resetPasswordExpires = undefined;
    await provider.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req: any, res: any) => {
  try {
    let user = await User.findById(req.user._id).select("-password");
    if (!user) {
      user = await Provider.findById(req.user._id).select("-password");
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProvider = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, formData, records, image } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Missing provider ID" });
    }

    const provider = await Provider.findById(userId);
    if (!provider) {
      return res.status(404).json({ message: "User not found." });
    }

    if (formData) {
      Object.assign(provider, formData);
    }

    if (records && Array.isArray(records)) {
      provider.records = records;
    }

    
    if (image && typeof image === "object" && image.base64) { 
      if (provider.image?.public_id) {
        await cloudinary.uploader.destroy(provider.image.public_id);
      }
    
      const result = await cloudinary.uploader.upload(image.base64, {
        folder: "verifiedProviders",
      });
    console.log(result)
      provider.image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }
console.log(provider)
    await provider.save();

    return res.status(200).json({
      provider,
      message: "User updated successfully.",
    });
  } catch (error: unknown) {
    console.error("Error updating provider:", error);
    if (error instanceof Error) {
      return res.status(500).json({
        message: "An error occurred while updating the provider.",
        error: error.message,
      });
    } else {
      return res.status(500).json({
        message: "An unknown error occurred while updating the provider.",
      });
    }
  }
};




// export const getAllVerifiedProviders = async (req: any, res: any) => {
//   try {
//     const providers = await Provider.find();
//     res.status(200).json(providers);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to retrieve providers", error });
//   }
// };

export const getVerifiedProvider = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findById(id); // No need for .populate()

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    // Remove invalid files (those missing `url` or with zero size)
    provider.uploadedFiles = provider.uploadedFiles.filter(
      (file) => file.url && file.originalFilename
    );    
    return res.status(200).json(provider);
  } catch (error) {
    console.error("Error fetching provider:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUploadedFile = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { providerId, fileId, publicId } = req.body;

    if (!providerId || !fileId || !publicId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    await cloudinary.uploader.destroy(publicId);
    const provider = await Provider.findByIdAndUpdate(
      providerId,
      { $pull: { uploadedFiles: { _id: fileId } } },
      { new: true } // Returns the updated provider
    );

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.status(200).json({
      message: "File deleted successfully",
      uploadedFiles: provider.uploadedFiles, // Return updated files list
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// export const updateProviderImage = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const { providerId, image } = req.body; // Extract providerId and image from request body

//     // Find the provider in the database
//     const provider = await Provider.findById(providerId);
//     if (!provider) {
//       return res.status(404).json({ message: "Provider not found" });
//     }

//     // Delete old image from Cloudinary if it exists
//     if (provider.image?.public_id) {
//       await cloudinary.uploader.destroy(provider.image.public_id);
//     }

//     // Upload new image to Cloudinary
//     const result = await cloudinary.uploader.upload(image, {
//       folder: "verifiedProviders",
//     });

//     // Update provider's image in MongoDB
//     provider.image = {
//       public_id: result.public_id,
//       url: result.secure_url,
//     };
//     await provider.save();

//     res.status(200).json({
//       message: "Profile image updated successfully",
//       image: provider.image,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating profile image", error });
//   }
// };

// export const updateProviderRecords = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const { providerId, records } = req.body; // Extract providerId and records from request body

//     // Find the provider in the database
//     const provider = await Provider.findById(providerId);
//     if (!provider) {
//       return res.status(404).json({ message: "Provider not found" });
//     }

//     // Update provider's records in MongoDB with the new records coming from the frontend
//     provider.records = records;
//     await provider.save();

//     res.status(200).json({
//       message: "Provider records updated successfully",
//       records: provider.records,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating provider records", error });
//   }
// };
