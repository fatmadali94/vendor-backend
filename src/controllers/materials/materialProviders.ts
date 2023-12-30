import express from "express";
var mongoose = require("mongoose");
import {
  deleteMaterialProviderById,
  getMaterialProviderById,
  getMaterialProviders,
  MaterialProviderModel,
} from "../../db/materials/materialProviders";

import { materialGradeModel } from "../../db/materials/materialGrades";
import { materialNameModel } from "../../db/materials/materialNames";
import { materialGroupModel } from "../../db/materials/materialGroups";
import { difference } from "../../helpers";

const cloudinary = require("../../utils/cloudinary");

export const getAllProviders = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const providers = await getMaterialProviders();
    return res.status(200).json(providers);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const deleteProvider = async (
  req: express.Request,
  res: express.Response
) => {
  // const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const provider: any = await deleteMaterialProviderById(id);
    if (provider.image) {
      const imgId = provider?.image?.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    // if (provider!.image) {
    //   const prevImage = provider!.image.replace(url + "/", "");
    //   fs.unlink("public/" + prevImage, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }

    await materialGradeModel.updateMany(
      { _id: provider!.materialgrades },
      { $pull: { providers: provider!._id } }
    );

    return res.json(provider);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const updateProvider = async (
  req: express.Request<{
    id: any;

    params: any;
  }>,
  res: express.Response
) => {
  // if (req.body || req.file || req.params) {
  //   console.log(req.body, "body request");
  //   console.log(req.params, "params request");
  //   console.log(req.file, "file request");
  // }
  // const url = req.protocol + "://" + req.get("host");

  try {
    const _id = req.params.id;
    const oldProvider: any = await MaterialProviderModel.findOne({ _id });

    const updatedProvider = <any>{
      // ...req.body,
      series: req.body.series ? req.body.series : oldProvider.series,
      model: req.body.model ? req.body.model : oldProvider.model,
      price: req.body.price ? req.body.price : oldProvider.price,
      description: req.body.description
        ? req.body.description
        : oldProvider.description,
      features: req.body.features ? req.body.features : oldProvider.features,
      slug: req.body.slug ? req.body.slug : oldProvider.slug,
      instock: req.body.instock ? req.body.instock : oldProvider.instock,
      materialgrades: req.body.materialgrades,
    };

    if (!updatedProvider) {
      return res.sendStatus(400);
    }
    if (oldProvider.image !== "") {
      // const imgId = oldMaterialGrade[0].image.public_id;
      const imgId = oldProvider.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "providers",
      });
      updatedProvider.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }

    const newMaterialGrades: any = updatedProvider!.materialgrades || [];
    // const oldProvider = await ProviderModel.findOne({ _id });
    const oldMaterialGrades = oldProvider!.materialgrades;

    // these are new ids turned into objectIDs with looping

    // const newMaterialGradeIds = newMaterialGrades.map(
    //   (sub: { _id: string }) => new mongoose.Types.ObjectId(sub._id)
    // );
    let newMaterialGradeIds = [];
    // if (newMaterialGrades instanceof Array) {
    if (newMaterialGrades !== "") {
      //   newMaterialGradeIds = newMaterialGrades!.map(
      //     (sub: { _id: string }) => new mongoose.Types.ObjectId(sub._id)
      //   );
      // } else {
      newMaterialGradeIds.push(new mongoose.Types.ObjectId(newMaterialGrades));
    }
    // if (oldProvider!.image) {
    //   var prevImage = oldProvider!.image.replace(url + "/", "");
    // }
    if (oldProvider) {
      Object.assign(oldProvider, updatedProvider);
    }
    const newProvider = await oldProvider!.save();

    // if (oldProvider!.image) {
    //   fs.unlink("public/" + prevImage!, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }

    const added = difference(newMaterialGradeIds, oldMaterialGrades);
    const removed = difference(oldMaterialGrades, newMaterialGradeIds);

    await materialGradeModel.updateMany(
      { _id: removed },
      { $pull: { providers: oldProvider!._id } }
    );
    await materialGradeModel.updateMany(
      { _id: added },
      { $addToSet: { providers: oldProvider!._id } }
    );

    return res.status(200).json(newProvider).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const createProvider = async (
  req: express.Request<{ file: any }>,
  res: express.Response
) => {
  // const url = req.protocol + "://" + req.get("host");
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "providers",
    });
    const newProvider = <any>new MaterialProviderModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    await newProvider.save();

    await materialGradeModel.updateMany(
      { _id: newProvider!.materialgrades },
      { $addToSet: { materialproviders: newProvider!._id } }
    );
    await materialNameModel.updateMany(
      { _id: newProvider!.materialnames },
      { $addToSet: { materialproviders: newProvider!._id } }
    );
    await materialGroupModel.updateMany(
      { _id: newProvider!.materialgroups },
      { $addToSet: { materialproviders: newProvider!._id } }
    );
    return res.status(200).json(newProvider!).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const getProvider = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    const provider = await getMaterialProviderById(id);
    return res.status(200).json(provider);
  } catch (error) {
    // console.log(error);
    res.sendStatus(400);
  }
};
