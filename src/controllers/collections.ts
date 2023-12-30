import express from "express";
import { partGroupModel } from "../db/parts/partGroups";
import { materialGroupModel } from "../db/materials/materialGroups";
import { PartProviderModel } from "../db/parts/partProviders";
import { partGeneralIdModel } from "../db/parts/partGeneralIds";
import { materialGradeModel } from "../db/materials/materialGrades";

export const getParts = () =>
  partGroupModel.find().populate({
    path: "partnames",
    populate: {
      path: "partgeneralids",
      populate: {
        path: "partproviders",
        model: "PartProviders",
      },
    },
  });
export const getMaterials = () =>
  materialGroupModel.find().populate({
    path: "materialnames",
    populate: {
      path: "materialgrades",
      populate: {
        path: "materialproviders",
      },
    },
  });

export const getAllCollections = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const parts = await getParts();
    // console.log(parts);

    const materials = await getMaterials();
    // console.log(materials);

    // return res.status(200).json(collections);
    return res.status(200).json(parts);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
