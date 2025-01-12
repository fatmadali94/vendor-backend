import express from "express";
var mongoose = require("mongoose");

import {
  getPartNames,
  deletePartNameById,
  updatePartNameById,
} from "../../db/parts/partNames";
import { partNameModel } from "../../db/parts/partNames";

import cloudinary from "../../utils/cloudinary";

export const getAllPartNames = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const partNames = await getPartNames();
    return res.status(200).json(partNames);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const deletePartName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deletedPartName: any = await deletePartNameById(id);
    if (deletedPartName.image) {
      const imgId = deletedPartName.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    return res.status(200).json("partName got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const createPartName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "partnames",
    });
    // const url = req.protocol + "://" + req.get("host");
    const newPartName = new partNameModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      // url + "/subcategory/" + (req as unknown as MulterRequest).file.filename,
    });

    await newPartName.save();
    return res.status(200).json(newPartName).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

export const updatePartName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const previousPartName: any = await partNameModel.find({
      _id: id,
    });

    const updatedPartName: any = {
      title: req.body.title ? req.body.title : previousPartName?.title,
      description: req.body.description
        ? req.body.description
        : previousPartName?.description,
      partGeneralIds: req.body.selectedIds
        ? req.body.selectedIds
        : previousPartName.partGeneralIds,
    };
    if (req.body.image) {
      const imgId = previousPartName.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "partNames",
      });
      updatedPartName.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }

    const newPartName = await updatePartNameById(id, updatedPartName);
    console.log("newPartName", newPartName);
    return res.status(200).json(newPartName).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
