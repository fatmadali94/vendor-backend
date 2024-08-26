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

dotenv.config();

const hashPassword = async (password: string) => {
  const saltRounds = 10; // You can increase this number to make it more secure
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

const validatePassword = async (password: string, hashedPassword: string) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};
const generateToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

// USER /////////////////////////////

export const registerUser = async (req: any, res: any) => {
  const data = req.body;
  try {
    const verificationCode = crypto.randomBytes(3).toString("hex");
    const hashedPassword = await hashPassword(data.password);
    const unverifiedUser = new UnverifiedUser({
      ...data,
      password: hashedPassword,
      verificationCode,
    });
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
    const user = new User(unverifiedUser.toObject());
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

/// PROVIDER /////////////////

export const registerProvider = async (req: any, res: any) => {
  const data = req.body;
  try {
    const verificationCode = crypto.randomBytes(3).toString("hex");
    const hashedPassword = await hashPassword(data.password);
    const unverifiedProvider = new UnverifiedProvider({
      ...data,
      password: hashedPassword,
      verificationCode,
    });
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
    const provider = new Provider(unverifiedProvider.toObject());
    await provider.save();

    // Remove the unverified provider from the UnverifiedUser collection
    await UnverifiedProvider.deleteOne({ email: unverifiedProvider.email });

    const token = generateToken(provider._id);
    await sendWelcomeEmail(provider.email);
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
