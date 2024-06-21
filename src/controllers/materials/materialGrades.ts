import express from "express";
var mongoose = require("mongoose");
// const fs = require("fs");
import {
  getMaterialGrades,
  // getMaterialGradeById,
  deleteMaterialGradeById,
  // updateMaterialGradeById,
} from "../../db/materials/materialGrades";
import { materialGradeModel } from "../../db/materials/materialGrades";

const cloudinary = require("../../utils/cloudinary");

export const getAllMaterialGrades = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const materialGrades = await getMaterialGrades();
    return res.status(200).json(materialGrades);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const deleteMaterialGrade = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deletedMaterialGrade: any = await deleteMaterialGradeById(id);
    if (deletedMaterialGrade.image) {
      const imgId = deletedMaterialGrade.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }

    return res.status(200).json("materialGrade got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const createMaterialGrade = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "materialgrades",
    });
    const newMaterialGrade = new materialGradeModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    await newMaterialGrade.save();
    return res.status(200).json(newMaterialGrade).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

// export const getMaterialGrade = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const { id } = req.params;
//     const product = await getMaterialGradeById(id);
//     return res.status(200).json(product);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(400);
//   }
// };

// export const updateMaterialGrade = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const _id = req.params.id;
//     const oldMaterialGrade: any = await materialGradeModel.findOne({ _id });
//     const updatedMaterialGrade: any = {
//       // ...req.body,
//       title: req.body.title ? req.body.title : oldMaterialGrade.title,
//       description: req.body.description
//         ? req.body.description
//         : oldMaterialGrade.description,
//       slug: req.body.slug ? req.body.slug : oldMaterialGrade.slug,
//       materialnames: req.body.materialnames,
//     };
//     if (oldMaterialGrade.image !== "") {
//       // const imgId = oldMaterialGrade[0].image.public_id;
//       const imgId = oldMaterialGrade.image.public_id;
//       if (imgId) {
//         await cloudinary.uploader.destroy(imgId);
//       }
//       const newImg = await cloudinary.uploader.upload(req.body.image, {
//         folder: "materialgrades",
//       });
//       updatedMaterialGrade.image = {
//         public_id: newImg.public_id,
//         url: newImg.secure_url,
//       };
//     }

//     if (oldMaterialGrade) {
//       Object.assign(oldMaterialGrade, updatedMaterialGrade);
//     }
//     const newMaterialGrade = await oldMaterialGrade!.save();
//     return res.status(200).json(newMaterialGrade).end();
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(400);
//   }
// };
