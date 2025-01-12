import express from "express";
import {
  deleteMaterialGroupById,
  getMaterialGroups,
  // getMaterialGroupById,
  // updateMaterialGroupById,
  materialGroupModel,
  updateMaterialGroupById,
} from "../../db/materials/materialGroups";
import cloudinary from "../../utils/cloudinary";

interface MulterRequest extends express.Request {
  file: any;
}

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
  try {
    const { id } = req.params;
    const deletedMaterialGroup: any = await deleteMaterialGroupById(id);

    if (deletedMaterialGroup.image) {
      const imgId = deletedMaterialGroup.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
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
  try {
    const { id } = req.params;
    const previousMaterialGroup: any = await materialGroupModel.find({
      _id: id,
    });

    const updatedMaterialGroup: any = {
      title: req.body.title ? req.body.title : previousMaterialGroup?.title,
      description: req.body.description
        ? req.body.description
        : previousMaterialGroup?.description,
      materialNames: req.body.selectedIds
        ? req.body.selectedIds
        : previousMaterialGroup.materialNames,
    };
    if (req.body.image) {
      const imgId = previousMaterialGroup.image.public_id;
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

    const newMaterialGroup = await updateMaterialGroupById(
      id,
      updatedMaterialGroup
    );

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

    const newMaterialGroup = new materialGroupModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
    await newMaterialGroup.save();

    return res.status(200).json(newMaterialGroup).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

// export const getMaterialGroup = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const { id } = req.params;

//     const materialGroup = await getMaterialGroupById(id);

//     return res.status(200).json(materialGroup);
//   } catch (error) {
//     res.sendStatus(400);
//   }
// };
