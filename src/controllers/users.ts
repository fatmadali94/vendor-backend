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
import UnverifiedProvider from "../db/unverifiedProviders";
import {
  hashPassword,
  generateToken,
  validatePassword,
} from "../utils/helpers";
import cloudinary from "../utils/cloudinary";

dotenv.config();

export const registerUser = async (req: any, res: any) => {
  const data = req.body;
  console.log("data", data);
  try {
    const verificationCode = crypto.randomBytes(3).toString("hex");
    const hashedPassword = await hashPassword(data.password);

    let newUserData = {
      ...data,
      password: hashedPassword,
      verificationCode,
    };
    if (req.body.image) {
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: "verifiedUsers", // Upload to the "users" folder in Cloudinary
      });
      newUserData = {
        ...newUserData,
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      };
    }

    const unverifiedUser = new UnverifiedUser(newUserData);
    await unverifiedUser.save();
    await sendVerificationEmail(unverifiedUser.email, verificationCode);
    res.status(201).json({ message: "Verification email sent" });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
      return res.status(400).json({ message: "Invalid verification code" });
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

    res.status(200).json({ message: "Verification code resent" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !validatePassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      message: "Login successful",
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
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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

    user.password = hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req: any, res: any) => {
  try {
    const { userId, ...updateData } = req.body;

    let user;
    user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user, message: "User updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while updating the user." });
  }
};
