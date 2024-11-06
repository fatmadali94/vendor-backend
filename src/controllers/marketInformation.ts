import express from "express";
var mongoose = require("mongoose");
import { MarketInfoModel } from "../db/marketInformation";
import cloudinary from "../utils/cloudinary";

export const getAllMarketInformations = () => MarketInfoModel.find();
export const getMarketInfoById = (id: string) => MarketInfoModel.findById(id);
export const deleteMarketInfoById = (id: string) =>
  MarketInfoModel.findOneAndDelete({ _id: id });

export const getAllMarketInfo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const marketInfos = await getAllMarketInformations();
    return res.status(200).json(marketInfos);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const deleteMarketInfo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deletedMarketInfo: any = await deleteMarketInfoById(id);
    if (deletedMarketInfo.image) {
      const imgId = deletedMarketInfo.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    return res.status(200).json("Market info got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const createMarketInfo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "marketInfos",
    });
    // const url = req.protocol + "://" + req.get("host");
    const newMarketInfo = new MarketInfoModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      // url + "/subcategory/" + (req as unknown as MulterRequest).file.filename,
    });
    await newMarketInfo.save();
    return res.status(200).json(newMarketInfo).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

export const getMarketInfo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const marketInfo = await getMarketInfoById(id);
    return res.status(200).json(marketInfo);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
