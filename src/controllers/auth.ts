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
  // console.log(req.body, "this is req body");

  const newUser = new userModel({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
    isAdmin: true,
  });
  // console.log(newUser, "this is new user");

  try {
    const savedUser = await newUser.save();
    // console.log("it worked");

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
  // console.log(req.body);

  try {
    const user: any = await userModel.findOne({ username: req.body.username });
    !user && res.status(401).json("Wrong credentials!");
    // console.log(user, "this is user");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    // console.log(OriginalPassword);

    OriginalPassword !== req.body.password &&
      res.status(401).json("Wrong credentials!");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );
    // console.log(accessToken, "access token");

    const { password, ...others } = user._doc;
    // console.log(user._doc);

    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
};
