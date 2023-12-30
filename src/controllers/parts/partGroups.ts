import express from "express";
import {
  deletePartGroupById,
  getPartGroups,
  getPartGroupById,
  updatePartGroupById,
  partGroupModel,
} from "../../db/parts/partGroups";
import { partNameModel } from "../../db/parts/partNames";

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
  // const url = req.protocol + "://" + req.get("host");
  try {
    const { id } = req.params;
    const deletedPartGroup: any = await deletePartGroupById(id);
    // console.log(deletedPartGroup, "deleted partGroup");

    if (deletedPartGroup.image) {
      const imgId = deletedPartGroup.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    // const prevImage = deletedPartGroup?.image?.replace(url + "/", "");
    // if (prevImage) {
    //   fs.unlink("public/" + prevImage!, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }

    await partNameModel.updateMany(
      { _id: deletedPartGroup!.partnames },
      { $pull: { partGroups: deletedPartGroup!._id } }
    );
    return res.status(200).json("old partGroup got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const updatePartGroup = async (
  req: express.Request,
  res: express.Response
) => {
  // const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;

    const previousPartGroup: any = await partGroupModel.find({
      _id: id,
    });
    // console.log(previousPartGroup[0], "prev partGroup");
    const updatedPartGroup: any = {
      title: req.body.title ? req.body.title : previousPartGroup[0]?.title,
      description: req.body.description
        ? req.body.description
        : previousPartGroup[0]?.description,
      partnames: previousPartGroup[0]?.partnames,

      // image:
      //   url +
      //     "/partGroup/" +
      //     (req as unknown as MulterRequest)!.file!.filename! ||
      //   previousPartGroup[0].image,
    };

    if (previousPartGroup.image !== "") {
      const imgId = previousPartGroup[0].image.public_id;
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
    // const prevImage = previousPartGroup[0]?.image?.replace(url + "/", "");
    // console.log(updatedPartGroup, "updatedCat");

    const newPartGroup = await updatePartGroupById(id, updatedPartGroup);

    // prevImage &&
    //   fs.unlink("public/" + prevImage!, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    return res.status(200).json(newPartGroup).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
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
    // console.log(result);

    // const url = req.protocol + "://" + req.get("host");
    const newPartGroup = new partGroupModel({
      ...req.body,
      // image: url + "/partGroup/" + (req as unknown as MulterRequest).file.filename,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
    // console.log(newPartGroup);
    await newPartGroup.save();

    return res.status(200).json(newPartGroup).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const getPartGroup = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    // console.log(id, "this is ID");

    const partGroup = await getPartGroupById(id);
    // console.log(partGroup);

    return res.status(200).json(partGroup);
  } catch (error) {
    // console.log(error);
    res.sendStatus(400);
  }
};
