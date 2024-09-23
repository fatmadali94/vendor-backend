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
dotenv.config();
import cloudinary from "../utils/cloudinary";

export const registerProvider = async (req: any, res: any) => {
  const data = req.body;
  try {
    const processedRecords = data.records.map((record: any) => {
      if (record.materialgroup || record.materialname || record.materialgrade) {
        return {
          materialgroup: record.materialgroup?.id,
          materialname: record.materialname?.id,
          materialgrade: record.materialgrade?.id,
        };
      } else if (record.partgroup || record.partname || record.partgeneralid) {
        return {
          partgroup: record.partgroup?.id,
          partname: record.partname?.id,
          partgeneralid: record.partgeneralid?.id,
        };
      }
      return {};
    });
    const verificationCode = crypto.randomBytes(3).toString("hex");
    const hashedPassword = await hashPassword(data.password);
    let unverifiedProvider;
    if (req.body.image) {
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: "verifiedProviders",
      });
      unverifiedProvider = new UnverifiedProvider({
        ...data,
        records: processedRecords,
        password: hashedPassword,
        verificationCode,
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      });
    } else {
      unverifiedProvider = new UnverifiedProvider({
        ...data,
        records: processedRecords,
        password: hashedPassword,
        verificationCode,
      });
    }
    await unverifiedProvider.save();
    await sendVerificationEmail(unverifiedProvider.email, verificationCode);
    res.status(201).json({ message: "Verification email sent" });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
      return res.status(400).json({ message: "Invalid verification code" });
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

export const loginProvider = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const provider = await Provider.findOne({ email });
    if (!provider || !validatePassword(password, provider.password)) {
      return res.status(401).json({ message: "Invalid email or password" });
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

export const updateProvider = async (req: any, res: any) => {
  try {
    const { userId, ...updateData } = req.body;

    let provider;
    provider = await Provider.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!provider) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ provider, message: "User updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while updating the user." });
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
    const provider = await getVerifiedProviderById(id);
    return res.status(200).json(provider);
  } catch (error) {
    res.sendStatus(400);
  }
};
