import express from "express";
var mongoose = require("mongoose");
// const fs = require("fs");
import { MessageModel, getAllMessages } from "../../db/messages";

export const getMessages = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const messages = await getAllMessages();
    return res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const createMessage = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const newMessage = new MessageModel({
      ...req.body,
    });

    await newMessage.save();
    return res.status(200).json(newMessage).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
