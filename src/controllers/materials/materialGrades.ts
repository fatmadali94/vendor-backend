import express from "express";
var mongoose = require("mongoose");
// const fs = require("fs");
import {
  getMaterialGrades,
  getMaterialGradeById,
  deleteMaterialGradeById,
  updateMaterialGradeById,
} from "../../db/materials/materialGrades";
import { materialGradeModel } from "../../db/materials/materialGrades";
import { difference } from "../../helpers";
import { materialNameModel } from "../../db/materials/materialNames";
import { MaterialProviderModel } from "../../db/materials/materialProviders";

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
  // const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const deletedMaterialGrade: any = await deleteMaterialGradeById(id);
    if (deletedMaterialGrade.image) {
      const imgId = deletedMaterialGrade.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    // const prevImage = deletedMaterialGrade!.image.replace(url + "/", "");
    // if (prevImage) {
    //   fs.unlink("public/" + prevImage, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }
    await materialNameModel.updateMany(
      { _id: deletedMaterialGrade!.materialnames },
      { $pull: { materialgrades: deletedMaterialGrade!._id } }
    );
    await materialNameModel.updateMany(
      { _id: deletedMaterialGrade!.materialproviders },
      { $pull: { materialgrades: deletedMaterialGrade!._id } }
    );

    return res.status(200).json("materialGrade got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const updateMaterialGrade = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const _id = req.params.id;
    const oldMaterialGrade: any = await materialGradeModel.findOne({ _id });
    const updatedMaterialGrade: any = {
      // ...req.body,
      title: req.body.title ? req.body.title : oldMaterialGrade.title,
      description: req.body.description
        ? req.body.description
        : oldMaterialGrade.description,
      slug: req.body.slug ? req.body.slug : oldMaterialGrade.slug,
      materialnames: req.body.materialnames,
    };
    if (oldMaterialGrade.image !== "") {
      // const imgId = oldMaterialGrade[0].image.public_id;
      const imgId = oldMaterialGrade.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "materialgrades",
      });
      updatedMaterialGrade.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }
    // if (!updatedMaterialGrade) {
    //   return res.sendStatus(400);
    // }
    const newMaterialName: any = updatedMaterialGrade!.materialnames || [];
    // console.log(newMaterialName, "newMaterialName");

    const oldMaterialName: any = oldMaterialGrade?.materialnames;
    // console.log(oldMaterialName, "oldMaterialName");
    // these are new ids turned into objectIDs with looping
    let newMaterialNameIds = [];
    if (newMaterialName !== "") {
      //   newMaterialNameIds = newMaterialName.map(
      //     (cat: { _id: string }) => new mongoose.Types.ObjectId(cat._id)
      //   );
      // } else {
      // newMaterialNameIds.push(new mongoose.Types.ObjectId(newMaterialName._id));
      newMaterialNameIds.push(new mongoose.Types.ObjectId(newMaterialName));
    }
    // console.log(newMaterialNameIds, "new category ids");

    if (oldMaterialGrade) {
      Object.assign(oldMaterialGrade, updatedMaterialGrade);
    }
    // console.log(oldMaterialGrade, "old sub cateogry");

    const newMaterialGrade = await oldMaterialGrade!.save();
    // console.log(newMaterialGrade, "new sub category");

    const added = difference(newMaterialNameIds, oldMaterialName);
    // console.log(added, "added");

    const removed = difference(oldMaterialName, newMaterialNameIds);
    // console.log(removed, "removed");

    await materialNameModel.updateMany(
      { _id: removed },
      { $pull: { materialGrades: oldMaterialGrade!._id } }
    );
    await materialNameModel.updateMany(
      { _id: added },
      { $addToSet: { materialGrades: oldMaterialGrade!._id } }
    );

    return res.status(200).json(newMaterialGrade).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
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
    // const url = req.protocol + "://" + req.get("host");
    const newMaterialGrade = new materialGradeModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      // url + "/subcategory/" + (req as unknown as MulterRequest).file.filename,
    });
    // console.log(newMaterialGrade);

    await newMaterialGrade.save();

    await materialNameModel.updateMany(
      { _id: newMaterialGrade.materialnames },
      { $addToSet: { materialgrades: newMaterialGrade._id } }
    );
    return res.status(200).json(newMaterialGrade).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const getMaterialGrade = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const product = await getMaterialGradeById(id);
    return res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
