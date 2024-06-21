import express from "express";
var mongoose = require("mongoose");
import {
  deleteMaterialProviderById,
  getMaterialProviderById,
  getMaterialProviders,
  MaterialProviderModel,
} from "../../db/materials/materialProviders";

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
  try {
    const { id } = req.params;
    const provider: any = await deleteMaterialProviderById(id);
    if (provider.image) {
      const imgId = provider?.image?.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }

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
    const oldProvider: any = await MaterialProviderModel.findOne({ _id });
    const updatedProvider = <any>{
      name: req.body.name ? req.body.name : oldProvider.name,
      address: req.body.address ? req.body.address : oldProvider.address,
      export_destination: req.body.export_destination
        ? req.body.export_destination
        : oldProvider.export_destination,
      has_export: req.body.has_export
        ? req.body.has_export
        : oldProvider.has_export,
      score: req.body.score ? req.body.score : oldProvider.score,
      knowledge_based: req.body.knowledge_based
        ? req.body.knowledge_based
        : oldProvider.knowledge_based,
      establish_year: req.body.establish_year
        ? req.body.establish_year
        : oldProvider.establish_year,
      production_type: req.body.production_type
        ? req.body.production_type
        : oldProvider.production_type,
      production_volume: req.body.production_volume
        ? req.body.production_volume
        : oldProvider.production_volume,
      cooperation_length: req.body.cooperation_length
        ? req.body.cooperation_length
        : oldProvider.cooperation_length,
      phone: req.body.phone ? req.body.phone : oldProvider.phone,
      description: req.body.description
        ? req.body.description
        : oldProvider.description,
      link: req.body.link ? req.body.link : oldProvider.link,
      records: req.body.records ? req.body.records : oldProvider.records,
    };

    if (!updatedProvider) {
      return res.sendStatus(400);
    }
    if (oldProvider.image !== "" && req.body.image) {
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
    if (oldProvider) {
      Object.assign(oldProvider, updatedProvider);
    }
    const newProvider = await oldProvider!.save();

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
  try {
    let newProvider = null;
    if (req.body.image) {
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: "providers",
      });
      newProvider = new MaterialProviderModel({
        ...req.body,
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      });
    } else {
      newProvider = new MaterialProviderModel({
        ...req.body,
      });
    }

    await newProvider.save();
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
    res.sendStatus(400);
  }
};
