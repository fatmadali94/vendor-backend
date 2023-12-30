import express from "express";
var mongoose = require("mongoose");
// const fs = require("fs");
import {
  getPartGeneralIds,
  getPartGeneralIdById,
  deletePartGeneralIdById,
  updatePartGeneralIdById,
} from "../../db/parts/partGeneralIds";
import { partGeneralIdModel } from "../../db/parts/partGeneralIds";
import { difference } from "../../helpers";
import { partNameModel } from "../../db/parts/partNames";
import { PartProviderModel } from "../../db/parts/partProviders";
// import { categoryModel } from "../db/partnames";
// import { ProductModel } from "../db/products";
// import { Description } from "@material-ui/icons";
const cloudinary = require("../../utils/cloudinary");

// import { stringify } from "querystring";

// interface MulterRequest extends express.Request {
//   file: any;
// }

export const getAllPartsGeneralIds = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const partGeneralIds = await getPartGeneralIds();
    return res.status(200).json(partGeneralIds);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const deletePartsGeneralId = async (
  req: express.Request,
  res: express.Response
) => {
  // const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const deletedPartGeneralId: any = await deletePartGeneralIdById(id);
    if (deletedPartGeneralId.image) {
      const imgId = deletedPartGeneralId.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    // const prevImage = deletedPartGeneralId!.image.replace(url + "/", "");
    // if (prevImage) {
    //   fs.unlink("public/" + prevImage, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }
    await partNameModel.updateMany(
      { _id: deletedPartGeneralId!.partnames },
      { $pull: { partgeneralids: deletedPartGeneralId!._id } }
    );
    await PartProviderModel.updateMany(
      { _id: deletedPartGeneralId!.products },
      { $pull: { partgeneralids: deletedPartGeneralId!._id } }
    );

    return res.status(200).json("partGeneralId got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const updatePartsGeneralId = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const _id = req.params.id;
    const oldPartGeneralId: any = await partGeneralIdModel.findOne({ _id });
    const updatedPartGeneralId: any = {
      // ...req.body,
      title: req.body.title ? req.body.title : oldPartGeneralId.title,
      description: req.body.description
        ? req.body.description
        : oldPartGeneralId.description,
      slug: req.body.slug ? req.body.slug : oldPartGeneralId.slug,
      partnames: req.body.partnames,
    };
    if (oldPartGeneralId.image !== "") {
      // const imgId = oldPartGeneralId[0].image.public_id;
      const imgId = oldPartGeneralId.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "partgeneralids",
      });
      updatedPartGeneralId.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }
    // if (!updatedPartGeneralId) {
    //   return res.sendStatus(400);
    // }
    const newPartNames: any = updatedPartGeneralId!.partnames || [];
    // console.log(newPartNames, "newPartNames");

    const oldPartNames: any = oldPartGeneralId?.partnames;
    // console.log(oldPartNames, "oldPartNames");
    // these are new ids turned into objectIDs with looping
    let newPartNameIds = [];
    if (newPartNames !== "") {
      //   newPartNameIds = newPartNames.map(
      //     (cat: { _id: string }) => new mongoose.Types.ObjectId(cat._id)
      //   );
      // } else {
      // newPartNameIds.push(new mongoose.Types.ObjectId(newPartNames._id));
      newPartNameIds.push(new mongoose.Types.ObjectId(newPartNames));
    }
    // console.log(newPartNameIds, "new category ids");

    if (oldPartGeneralId) {
      Object.assign(oldPartGeneralId, updatedPartGeneralId);
    }
    // console.log(oldPartGeneralId, "old sub cateogry");

    const newPartGeneralId = await oldPartGeneralId!.save();
    // console.log(newPartGeneralId, "new sub category");

    const added = difference(newPartNameIds, oldPartNames);
    // console.log(added, "added");

    const removed = difference(oldPartNames, newPartNameIds);
    // console.log(removed, "removed");

    await partNameModel.updateMany(
      { _id: removed },
      { $pull: { partGeneralIds: oldPartGeneralId!._id } }
    );
    await partNameModel.updateMany(
      { _id: added },
      { $addToSet: { partGeneralIds: oldPartGeneralId!._id } }
    );

    return res.status(200).json(newPartGeneralId).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const createPartsGeneralId = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "partgeneralids",
    });
    // const url = req.protocol + "://" + req.get("host");
    const newPartGeneralId = new partGeneralIdModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      // url + "/subcategory/" + (req as unknown as MulterRequest).file.filename,
    });
    // console.log(newPartGeneralId);

    await newPartGeneralId.save();

    await partNameModel.updateMany(
      { _id: newPartGeneralId.partnames },
      { $addToSet: { partgeneralids: newPartGeneralId._id } }
    );
    return res.status(200).json(newPartGeneralId).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const getPartsGeneralId = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const product = await getPartGeneralIdById(id);
    return res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
