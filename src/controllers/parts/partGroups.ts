import express from "express";
import {
  deletePartGroupById,
  getPartGroups,
  partGroupModel,
  updatePartGroupById,
} from "../../db/parts/partGroups";
import cloudinary from "../../utils/cloudinary";

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

export const updatePartGroup = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const previousPartGroup: any = await partGroupModel.find({
      _id: id,
    });

    const updatedPartGroup: any = {
      title: req.body.title ? req.body.title : previousPartGroup?.title,
      description: req.body.description
        ? req.body.description
        : previousPartGroup?.description,
      partNames: req.body.selectedIds
        ? req.body.selectedIds
        : previousPartGroup.partNames,
    };
    if (req.body.image) {
      const imgId = previousPartGroup.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "partGroups",
      });
      updatedPartGroup.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }

    const newPartGroup = await updatePartGroupById(id, updatedPartGroup);
    console.log("newPartGroup", newPartGroup);
    return res.status(200).json(newPartGroup).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
