import express from "express";
var mongoose = require("mongoose");

import {
  getMaterialNames,
  getMaterialNameById,
  deleteMaterialNameById,
  updateMaterialNameById,
} from "../../db/materials/materialNames";
import { materialNameModel } from "../../db/materials/materialNames";
import { difference } from "../../helpers";

import { materialGroupModel } from "../../db/materials/materialGroups";
import { materialGradeModel } from "../../db/materials/materialGrades";

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

    await materialGroupModel.updateMany(
      { _id: deletedMaterialName!.materialgroups },
      { $pull: { materialnames: deletedMaterialName!._id } }
    );
    await materialGradeModel.updateMany(
      { _id: deletedMaterialName!.products },
      { $pull: { materialnames: deletedMaterialName!._id } }
    );

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
      // ...req.body,
      title: req.body.title ? req.body.title : oldMaterialName.title,
      description: req.body.description
        ? req.body.description
        : oldMaterialName.description,
      slug: req.body.slug ? req.body.slug : oldMaterialName.slug,
      materialgroups: req.body.materialgroups,
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
    // if (!updatedMaterialName) {
    //   return res.sendStatus(400);
    // }
    const newMaterialGroups: any = updatedMaterialName!.materialgroups || [];
    // console.log(newMaterialGroups, "newMaterialGroups");

    const oldMaterialGroups: any = oldMaterialName?.materialgroups;
    // console.log(oldMaterialGroups, "oldMaterialGroups");
    // these are new ids turned into objectIDs with looping
    let newMaterialGroupIds = [];
    if (newMaterialGroups !== "") {
      //   newCategoryIds = newMaterialGroups.map(
      //     (cat: { _id: string }) => new mongoose.Types.ObjectId(cat._id)
      //   );
      // } else {
      // newCategoryIds.push(new mongoose.Types.ObjectId(newMaterialGroups._id));
      newMaterialGroupIds.push(new mongoose.Types.ObjectId(newMaterialGroups));
    }
    // console.log(newCategoryIds, "new category ids");

    if (oldMaterialName) {
      Object.assign(oldMaterialName, updatedMaterialName);
    }
    // console.log(oldMaterialName, "old sub cateogry");

    const newMaterialName = await oldMaterialName!.save();

    const added = difference(newMaterialGroupIds, oldMaterialGroups);

    const removed = difference(oldMaterialGroups, newMaterialGroupIds);

    await materialGroupModel.updateMany(
      { _id: removed },
      { $pull: { materialNames: oldMaterialName!._id } }
    );
    await materialGroupModel.updateMany(
      { _id: added },
      { $addToSet: { materialNames: oldMaterialName!._id } }
    );

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
    // console.log(newMaterialName);

    await newMaterialName.save();

    await materialGroupModel.updateMany(
      { _id: newMaterialName.materialgroups },
      { $addToSet: { materialnames: newMaterialName._id } }
    );
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
