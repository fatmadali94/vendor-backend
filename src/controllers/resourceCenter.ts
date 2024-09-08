import express from "express";
var mongoose = require("mongoose");
import { ResourceCenterModel } from "../db/resourceCenter";

const cloudinary = require("../utils/cloudinary");

export const getResources = () => ResourceCenterModel.find();
export const getResourceById = (id: string) => ResourceCenterModel.findById(id);
export const deleteResourceById = (id: string) =>
  ResourceCenterModel.findOneAndDelete({ _id: id });

export const getAllResources = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const resources = await getResources();
    return res.status(200).json(resources);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const deleteResource = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deletedResource: any = await deleteResourceById(id);
    if (deletedResource.image) {
      const imgId = deletedResource.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    return res.status(200).json("Resource got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const createResource = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "resources",
    });
    const newResource = new ResourceCenterModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    await newResource.save();
    return res.status(200).json(newResource).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

export const getResource = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const resource = await deleteResourceById(id);
    return res.status(200).json(resource);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
