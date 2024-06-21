import express from "express";
import {
  deletePartGroupById,
  getPartGroups,
  partGroupModel,
} from "../../db/parts/partGroups";
const cloudinary = require("../../utils/cloudinary");

interface MulterRequest extends express.Request {
  file: any;
}

export const getAllPartGroups = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const partGroups = await getPartGroups();
    return res.status(200).json(partGroups);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const deletePartGroup = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deletedPartGroup: any = await deletePartGroupById(id);

    if (deletedPartGroup.image) {
      const imgId = deletedPartGroup.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    return res.status(200).json("old partGroup got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const createPartGroup = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "partGroups",
    });

    const newPartGroup = new partGroupModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
    await newPartGroup.save();

    return res.status(200).json(newPartGroup).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
