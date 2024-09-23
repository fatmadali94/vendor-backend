import express from "express";
var mongoose = require("mongoose");
import {
  getPartGeneralIds,
  deletePartGeneralIdById,
} from "../../db/parts/partGeneralIds";
import { partGeneralIdModel } from "../../db/parts/partGeneralIds";

import cloudinary from "../../utils/cloudinary";

export const getAllPartGeneralIds = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const partGeneralIds = await getPartGeneralIds();
    return res.status(200).json(partGeneralIds);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const deletePartGeneralId = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deletedPartGeneralId: any = await deletePartGeneralIdById(id);
    if (deletedPartGeneralId.image) {
      const imgId = deletedPartGeneralId.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }

    return res.status(200).json("Part General Id got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const createPartGeneralId = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "partgeneralids",
    });
    const newPartGeneralId = new partGeneralIdModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    await newPartGeneralId.save();
    return res.status(200).json(newPartGeneralId).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
