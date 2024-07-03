import express from "express";
import * as jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { AES } from "crypto-js";

import { userModel } from "../db/users";

//REGISTER
export const registerUser = async (
  req: express.Request,
  res: express.Response
) => {
  const newUser = new userModel({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC as string
    ).toString(),
    isAdmin: true,
  });

  try {
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

//LOGIN

export const loginUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const user: any = await userModel.findOne({ username: req.body.username });
    !user && res.status(401).json("Wrong credentials!");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC as string
    );
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    OriginalPassword !== req.body.password &&
      res.status(401).json("Wrong credentials!");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;

    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
};
