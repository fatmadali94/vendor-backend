import express from "express";
import * as CryptoJS from "crypto-js";

import { userModel } from "../db/users";

//UPDATE
export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

//DELETE
export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
};

//GET USER
export const getUser = async (req: express.Request, res: express.Response) => {
  try {
    const user: any = await userModel.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
};

//GET ALL USER
export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  const query = req.query.new;
  try {
    const users = query
      ? await userModel.find().sort({ _id: -1 }).limit(5)
      : await userModel.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

//GET USER STATS

export const getUserStats = async (
  req: express.Request,
  res: express.Response
) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await userModel.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};
