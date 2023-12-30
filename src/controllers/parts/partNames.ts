import express from "express";
var mongoose = require("mongoose");

import {
  getPartNames,
  getPartNameById,
  deletePartNameById,
  updatePartNameById,
} from "../../db/parts/partNames";
import { partNameModel } from "../../db/parts/partNames";
import { difference } from "../../helpers";
import { partGroupModel } from "../../db/parts/partGroups";
import { partGeneralIdModel } from "../../db/parts/partGeneralIds";

// import { Description } from "@material-ui/icons";
const cloudinary = require("../../utils/cloudinary");

// import { stringify } from "querystring";

// interface MulterRequest extends express.Request {
//   file: any;
// }

export const getAllPartNames = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const partNames = await getPartNames();
    return res.status(200).json(partNames);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const deletePartName = async (
  req: express.Request,
  res: express.Response
) => {
  // const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const deletedPartName: any = await deletePartNameById(id);
    if (deletedPartName.image) {
      const imgId = deletedPartName.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    // const prevImage = deletedPartName!.image.replace(url + "/", "");
    // if (prevImage) {
    //   fs.unlink("public/" + prevImage, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }
    await partGroupModel.updateMany(
      { _id: deletedPartName!.partgroups },
      { $pull: { partnames: deletedPartName!._id } }
    );
    await partGeneralIdModel.updateMany(
      { _id: deletedPartName!.products },
      { $pull: { partnames: deletedPartName!._id } }
    );

    return res.status(200).json("partName got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const updatePartName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const _id = req.params.id;
    const oldPartName: any = await partNameModel.findOne({ _id });
    const updatedPartName: any = {
      // ...req.body,
      title: req.body.title ? req.body.title : oldPartName.title,
      description: req.body.description
        ? req.body.description
        : oldPartName.description,
      slug: req.body.slug ? req.body.slug : oldPartName.slug,
      partgroups: req.body.partgroups,
    };
    if (oldPartName.image !== "") {
      // const imgId = oldPartName[0].image.public_id;
      const imgId = oldPartName.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "partnames",
      });
      updatedPartName.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }
    // if (!updatedPartName) {
    //   return res.sendStatus(400);
    // }
    const newPartGroups: any = updatedPartName!.partgroups || [];
    // console.log(newPartGroups, "newPartGroups");

    const oldPartGroups: any = oldPartName?.partgroups;
    // console.log(oldPartGroups, "oldPartGroups");
    // these are new ids turned into objectIDs with looping
    let newPartGroupIds = [];
    if (newPartGroups !== "") {
      //   newPartGroupIds = newPartGroups.map(
      //     (cat: { _id: string }) => new mongoose.Types.ObjectId(cat._id)
      //   );
      // } else {
      // newPartGroupIds.push(new mongoose.Types.ObjectId(newPartGroups._id));
      newPartGroupIds.push(new mongoose.Types.ObjectId(newPartGroups));
    }
    // console.log(newPartGroupIds, "new category ids");

    if (oldPartName) {
      Object.assign(oldPartName, updatedPartName);
    }
    // console.log(oldPartName, "old sub cateogry");

    const newPartName = await oldPartName!.save();
    // console.log(newPartName, "new sub category");

    const added = difference(newPartGroupIds, oldPartGroups);
    // console.log(added, "added");

    const removed = difference(oldPartGroups, newPartGroupIds);
    // console.log(removed, "removed");

    await partGroupModel.updateMany(
      { _id: removed },
      { $pull: { partNames: oldPartName!._id } }
    );
    await partGroupModel.updateMany(
      { _id: added },
      { $addToSet: { partNames: oldPartName!._id } }
    );

    return res.status(200).json(newPartName).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const createPartName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "partnames",
    });
    // const url = req.protocol + "://" + req.get("host");
    const newPartName = new partNameModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      // url + "/subcategory/" + (req as unknown as MulterRequest).file.filename,
    });
    // console.log(newPartName);

    await newPartName.save();

    await partGroupModel.updateMany(
      { _id: newPartName.partgroups },
      { $addToSet: { partnames: newPartName._id } }
    );
    return res.status(200).json(newPartName).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const getPartName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const product = await getPartNameById(id);
    return res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
