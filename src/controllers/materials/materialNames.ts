import express from "express";
var mongoose = require("mongoose");

import {
  getMaterialNames,
  // getMaterialNameById,
  deleteMaterialNameById,
  updateMaterialNameById,
  // updateMaterialNameById,
} from "../../db/materials/materialNames";
import { materialNameModel } from "../../db/materials/materialNames";

import cloudinary from "../../utils/cloudinary";

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

// export const getMaterialName = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const { id } = req.params;
//     const product = await getMaterialNameById(id);
//     return res.status(200).json(product);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(400);
//   }
// };

export const updateMaterialName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const previousMaterialName: any = await materialNameModel.find({
      _id: id,
    });

    const updatedMaterialName: any = {
      title: req.body.title ? req.body.title : previousMaterialName.title,
      description: req.body.description
        ? req.body.description
        : previousMaterialName.description,
      slug: req.body.slug ? req.body.slug : previousMaterialName.slug,
      materialGrades: req.body.selectedIds
        ? req.body.selectedIds
        : previousMaterialName.materialGrades,
    };

    if (req.body.image) {
      const imgId = previousMaterialName.image.public_id;
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
    const newMaterialGroup = await updateMaterialNameById(
      id,
      updatedMaterialName
    );

    return res.status(200).json(newMaterialGroup).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
