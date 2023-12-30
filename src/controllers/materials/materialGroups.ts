import express from "express";
import {
  deleteMaterialGroupById,
  getMaterialGroups,
  getMaterialGroupById,
  updateMaterialGroupById,
  materialGroupModel,
} from "../../db/materials/materialGroups";
import { materialNameModel } from "../../db/materials/materialNames";
// const multer = require("multer");
// const fs = require("fs");
const cloudinary = require("../../utils/cloudinary");

interface MulterRequest extends express.Request {
  file: any;
}
// interface previousMaterialGroup extends express. {
//   image: any;
// }

export const getAllMaterialGroups = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const materialGroups = await getMaterialGroups();
    return res.status(200).json(materialGroups);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const deleteMaterialGroup = async (
  req: express.Request,
  res: express.Response
) => {
  // const url = req.protocol + "://" + req.get("host");
  try {
    const { id } = req.params;
    const deletedMaterialGroup: any = await deleteMaterialGroupById(id);
    // console.log(deletedMaterialGroup, "deleted materialGroup");

    if (deletedMaterialGroup.image) {
      const imgId = deletedMaterialGroup.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    // const prevImage = deletedMaterialGroup?.image?.replace(url + "/", "");
    // if (prevImage) {
    //   fs.unlink("public/" + prevImage!, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }

    await materialNameModel.updateMany(
      { _id: deletedMaterialGroup!.materialnames },
      { $pull: { materialGroups: deletedMaterialGroup!._id } }
    );
    return res.status(200).json("old materialGroup got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const updateMaterialGroup = async (
  req: express.Request,
  res: express.Response
) => {
  // const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;

    const previousMaterialGroup: any = await materialGroupModel.find({
      _id: id,
    });
    // console.log(previousMaterialGroup[0], "prev materialGroup");
    const updatedMaterialGroup: any = {
      title: req.body.title ? req.body.title : previousMaterialGroup[0]?.title,
      description: req.body.description
        ? req.body.description
        : previousMaterialGroup[0]?.description,
      materialnames: previousMaterialGroup[0]?.materialnames,

      // image:
      //   url +
      //     "/materialGroup/" +
      //     (req as unknown as MulterRequest)!.file!.filename! ||
      //   previousMaterialGroup[0].image,
    };

    if (previousMaterialGroup.image !== "") {
      const imgId = previousMaterialGroup[0].image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "materialGroups",
      });
      updatedMaterialGroup.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }
    // const prevImage = previousMaterialGroup[0]?.image?.replace(url + "/", "");
    // console.log(updatedMaterialGroup, "updatedCat");

    const newMaterialGroup = await updateMaterialGroupById(
      id,
      updatedMaterialGroup
    );

    // prevImage &&
    //   fs.unlink("public/" + prevImage!, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    return res.status(200).json(newMaterialGroup).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

export const createMaterialGroup = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "materialGroups",
    });
    // console.log(result);

    // const url = req.protocol + "://" + req.get("host");
    const newMaterialGroup = new materialGroupModel({
      ...req.body,
      // image: url + "/materialGroup/" + (req as unknown as MulterRequest).file.filename,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
    // console.log(newMaterialGroup);
    await newMaterialGroup.save();

    return res.status(200).json(newMaterialGroup).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const getMaterialGroup = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    // console.log(id, "this is ID");

    const materialGroup = await getMaterialGroupById(id);
    // console.log(materialGroup);

    return res.status(200).json(materialGroup);
  } catch (error) {
    // console.log(error);
    res.sendStatus(400);
  }
};
