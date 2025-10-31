import express from "express";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../db/users";
import Provider from "../db/providers";
import crypto from "crypto";
import bcrypt from "bcrypt";
import UnverifiedUser from "../db/unverifiedUsers";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./emailService";
import {
  hashPassword,
  generateToken,
  validatePassword,
} from "../utils/helpers";
import cloudinary from "../utils/cloudinary";
import { sendSms } from "./smsService";

dotenv.config();

export const uploadUserFile = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { file, userId, originalFilename } = req.body;
    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const fileType = file.split(";")[0].split("/")[1].toLowerCase();

    let uploadOptions: {
      folder: string;
      resource_type?: "image" | "video" | "raw" | "auto";
    } = {
      folder: `user_uploads/${userId}`,
    };

    if (fileType === "pdf") {
      uploadOptions.resource_type = "raw";
    }
    const result = await cloudinary.uploader.upload(file, uploadOptions);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newFile = {
      public_id: result.public_id,
      url: result.secure_url,
      filename: result.original_filename,
      fileType,
      originalFilename: originalFilename,
    };
    // Add the uploaded file to the user's uploadedFiles array
    user.uploadedFiles = user.uploadedFiles || [];
    user.uploadedFiles.push(newFile);

    await user.save();

    res
      .status(200)
      .json({ message: "File uploaded successfully", file: newFile });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const registerUser = async (req: any, res: any) => {
  const data = req.body;
  console.log("🟢 Incoming registration data:", data);

  try {
    const verificationCode = crypto.randomBytes(3).toString("hex");
    console.log("🔐 Generated verification code:", verificationCode);

    const hashedPassword = await hashPassword(data.password);
    console.log("🔐 Hashed password created");

    let newUserData = {
      ...data,
      password: hashedPassword,
      verificationCode,
    };

    // Upload image if provided
    if (req.body.image) {
      console.log("🖼 Uploading image to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: "verifiedUsers",
      });
      console.log("✅ Image uploaded:", result.secure_url);

      newUserData = {
        ...newUserData,
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      };
    }

    const existingUser = await User.findOne({ email: newUserData.email });
    if (existingUser) {
      console.warn("⚠️ User already registered:", newUserData.email);
      return res.status(409).json({ message: "کاربر ثبت شده است" });
    }

    const existingUnverifiedUser = await UnverifiedUser.findOne({
      email: newUserData.email,
    });
    if (existingUnverifiedUser) {
      console.warn("⚠️ Unverified user already exists:", newUserData.email);
      return res.status(409).json({
        message:
          "درخواست شما قبلا ثبت شده است لطفا کد را وارد یا درخواست کد جدید دهید",
      });
    }

    const unverifiedUser = new UnverifiedUser(newUserData);
    await unverifiedUser.save();
    console.log("✅ Unverified user saved to DB:", newUserData.email);

    // ✅ Send email
    console.log("📧 Sending verification email...");
    await sendVerificationEmail(unverifiedUser.email, verificationCode);
    console.log("✅ Email sent to:", unverifiedUser.email);

    // Try SMS but don't fail the whole request if it errors
    let smsSent = false;
    if (unverifiedUser.cellphone) {
      const smsText = `کد تایید شما: ${verificationCode}`;
      try {
        console.log(`📱 Sending SMS to ${unverifiedUser.cellphone}: ${smsText}`);
        await sendSms(unverifiedUser.cellphone, smsText);
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


export const verifyUser = async (req: any, res: any) => {
  const { email, code } = req.body;
  try {
    const unverifiedUser = await UnverifiedUser.findOne({
      email,
      verificationCode: code,
    });
    if (!unverifiedUser) {
      return res.status(400).json({ message: "کد ورودی اشتباه می باشد" });
    }
    const { verificationCode, ...userData } = unverifiedUser.toObject();
    const user = new User(userData);
    await user.save();
    await UnverifiedUser.deleteOne({ email: unverifiedUser.email });
    await sendWelcomeEmail(user.email);
    const token = generateToken(user._id);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const resendUserVerificationCode = async (req: any, res: any) => {
  const { email } = req.body;
  try {
    const unverifiedUser = await UnverifiedUser.findOne({ email });
    if (!unverifiedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const verificationCode = crypto.randomBytes(3).toString("hex");
    unverifiedUser.verificationCode = verificationCode;
    await unverifiedUser.save();

    await sendVerificationEmail(unverifiedUser.email, verificationCode);
    if (unverifiedUser.cellphone) {
      const smsText = `کد تایید شما: ${verificationCode}`;
      try {
        console.log(`📱 Sending SMS to ${unverifiedUser.cellphone}: ${smsText}`);
        await sendSms(unverifiedUser.cellphone, smsText);
      } catch (err) {
        console.error("❌ Error sending SMS:", err.message);
      }
    }

    res.status(200).json({ message: "کد تایید دوباره ارسال شد" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeUnverifiedUser = async (req: any, res: any) => {
  const { email } = req.body;
  try {
    const unverifiedUser = await UnverifiedUser.findOne({ email });
    if (!unverifiedUser) {
      return res.status(404).json({ message: "کاربری پیدا نشد" });
    }
    await UnverifiedUser.deleteOne({ email: unverifiedUser.email });
    res.status(200).json({ message: "کد تایید دوباره ارسال شد" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !validatePassword(password, user.password)) {
      return res
        .status(401)
        .json({ message: "نام کاربری یا رمز عبور اشتباه است" });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      message: "ورود با موفقیت همراه بود",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const userForgotPassword = async (req: any, res: any) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "کاربری پیدا نشد" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({ message: "لینک پسورد با موفقیت ارسال شد " });
  } catch (error) {
    res
      .status(500)
      .json({ message: "مشکلی پیش آمده لطفا دقایقی دیگر تلاش کنید" });
  }
};

export const userResetPassword = async (req: any, res: any) => {
  const { token, newPassword } = req.body;
  try {
    const user: any = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: "پسورد شما با موفقیت تغییر کرد" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res
      .status(500)
      .json({ message: "مشکلی پیش آمده لطفا دقایقی دیگر تلاش کنید", error });
  }
};

export const updateUser = async (req: any, res: any) => {
  try {
    const { userId, ...updateData } = req.body;

    let user;
    user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ message: "کاربری پیدا نشد." });
    }

    res.status(200).json({ user, message: "User updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while updating the user." });
  }
};

export const updateUserImage = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, image } = req.body; // Extract providerId and image from request body

    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old image from Cloudinary if it exists
    if (user.image?.public_id) {
      await cloudinary.uploader.destroy(user.image.public_id);
    }

    // Upload new image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: "verifiedUsers",
    });

    // Update user's image in MongoDB
    user.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
    await user.save();

    res.status(200).json({
      message: "Profile image updated successfully",
      image: user.image,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile image", error });
  }
};

