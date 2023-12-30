import express from "express";
var mongoose = require("mongoose");
import {
  deletePartProviderById,
  getPartProviderById,
  getPartProviders,
  PartProviderModel,
} from "../../db/parts/partProviders";
import { partGeneralIdModel } from "../../db/parts/partGeneralIds";
import { difference } from "../../helpers";
import { partNameModel } from "../../db/parts/partNames";
import { partGroupModel } from "../../db/parts/partGroups";
const cloudinary = require("../../utils/cloudinary");

export const getAllProviders = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const providers = await getPartProviders();
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
    const provider: any = await deletePartProviderById(id);
    if (provider.image) {
      const imgId = provider?.image?.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }

    await partGeneralIdModel.updateMany(
      { _id: provider!.partgeneralids },
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
  try {
    const _id = req.params.id;
    const oldProvider: any = await PartProviderModel.findOne({ _id });

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
      partgeneralids: req.body.partgeneralids,
    };

    if (!updatedProvider) {
      return res.sendStatus(400);
    }
    if (oldProvider.image !== "") {
      // const imgId = oldPartGeneralId[0].image.public_id;
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

    const newPartGeneralIds: any = updatedProvider!.partgeneralids || [];
    // const oldProvider = await ProviderModel.findOne({ _id });
    const oldPartGeneralIds = oldProvider!.partgeneralids;

    let newPartGeneralIdIds = [];
    // if (newPartGeneralIds instanceof Array) {
    if (newPartGeneralIds !== "") {
      newPartGeneralIdIds.push(new mongoose.Types.ObjectId(newPartGeneralIds));
    }

    if (oldProvider) {
      Object.assign(oldProvider, updatedProvider);
    }
    const newProvider = await oldProvider!.save();

    const added = difference(newPartGeneralIdIds, oldPartGeneralIds);
    const removed = difference(oldPartGeneralIds, newPartGeneralIdIds);

    await partGeneralIdModel.updateMany(
      { _id: removed },
      { $pull: { providers: oldProvider!._id } }
    );
    await partGeneralIdModel.updateMany(
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
    const newProvider = <any>new PartProviderModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    await newProvider.save();

    await partGeneralIdModel.updateMany(
      { _id: newProvider!.partgeneralids },
      { $addToSet: { partproviders: newProvider!._id } }
    );

    await partNameModel.updateMany(
      { _id: newProvider!.partnames },
      { $addToSet: { partproviders: newProvider!._id } }
    );
    await partGroupModel.updateMany(
      { _id: newProvider!.partgroups },
      { $addToSet: { partproviders: newProvider!._id } }
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

    const provider = await getPartProviderById(id);
    return res.status(200).json(provider);
  } catch (error) {
    // console.log(error);
    res.sendStatus(400);
  }
};
