import express from "express";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

export const hashPassword = async (password: string) => {
  const saltRounds = 10; // You can increase this number to make it more secure
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const validatePassword = async (
  password: string,
  hashedPassword: string
) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

export const generateToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};
