import express from "express";
var mongoose = require("mongoose");

import {
  getMaterialNames,
  getMaterialNameById,
  deleteMaterialNameById,
  updateMaterialNameById,
} from "../../db/materials/materialNames";
import { materialNameModel } from "../../db/materials/materialNames";

const cloudinary = require("../../utils/cloudinary");

export const getAllMaterialNames = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const materialNames = await getMaterialNames();
    return res.status(200).json(materialNames);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const deleteMaterialName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deletedMaterialName: any = await deleteMaterialNameById(id);
    if (deletedMaterialName.image) {
      const imgId = deletedMaterialName.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    return res.status(200).json("materialName got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const updateMaterialName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const _id = req.params.id;
    const oldMaterialName: any = await materialNameModel.findOne({ _id });
    const updatedMaterialName: any = {
      title: req.body.title ? req.body.title : oldMaterialName.title,
      description: req.body.description
        ? req.body.description
        : oldMaterialName.description,
      slug: req.body.slug ? req.body.slug : oldMaterialName.slug,
    };
    if (oldMaterialName.image !== "") {
      // const imgId = oldMaterialName[0].image.public_id;
      const imgId = oldMaterialName.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "materialnames",
      });
      updatedMaterialName.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }

    if (oldMaterialName) {
      Object.assign(oldMaterialName, updatedMaterialName);
    }

    const newMaterialName = await oldMaterialName!.save();

    return res.status(200).json(newMaterialName).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const createMaterialName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "materialnames",
    });
    // const url = req.protocol + "://" + req.get("host");
    const newMaterialName = new materialNameModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      // url + "/subcategory/" + (req as unknown as MulterRequest).file.filename,
    });

    await newMaterialName.save();
    return res.status(200).json(newMaterialName).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const getMaterialName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const product = await getMaterialNameById(id);
    return res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
