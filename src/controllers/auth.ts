import express from "express";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../db/users";
import Provider from "../db/providers";

dotenv.config();

export const getMe = async (req: any, res: any) => {
  console.log("this is coming from the getMe");
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
