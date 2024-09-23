import express from "express";
import { getOffers, OfferModel } from "../db/offer";
import nodemailer from "nodemailer";

var mongoose = require("mongoose");
import cloudinary from "../utils/cloudinary";

export const getAllOffers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const offers = await getOffers();
    return res.status(200).json(offers);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const createOffer = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "offer",
    });
    const newOffer = new OfferModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    await newOffer.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "fatmadali94@gmail.com",
        pass: "iqia ghue botg xgta",
      },
    });
    const mailOptions = {
      from: "fatmadali94@gmail.com",
      // to: "fatmadali94@gmail.com",
      to: "kasramahsouli@gmail.com",
      subject: "special offer from Vendor.rierco.net",
      text: `\nName: ${req.body.name}\nPosition: ${req.body.position}\n Quantity: ${req.body.quantity}\nVolume: ${req.body.volume}\nEmail: ${req.body.email}\nMessage: ${req.body.description}/nPhone : ${req.body.phone}\n`,
      // attachments: [
      //   {
      //     filename: req.file.originalname,
      //     path: req.file.path
      //   }
      // ]
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.error(err);
        res.status(500).send("Error sending email");
      } else {
        console.log(info);
        res.send("Email sent successfully");
      }
    });
    return res.status(200).json(newOffer).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
