import express from "express";
import { PartProviderModel } from "../db/parts/partProviders";
import {
  MaterialProviderModel,
  getMaterialProviders,
} from "../db/materials/materialProviders";
import { getMaterialGroups } from "../db/materials/materialGroups";
import { getMaterialGrades } from "../db/materials/materialGrades";
import { getMaterialNames } from "../db/materials/materialNames";
import { getPartGroups } from "../db/parts/partGroups";
import { getPartGeneralIds } from "../db/parts/partGeneralIds";
import { getPartNames } from "../db/parts/partNames";

// export const getAllParts = () =>
//   partGroupModel.find().populate({
//     path: "partnames",
//     populate: {
//       path: "partgeneralids",
//       populate: {
//         path: "partproviders",
//         model: "PartProviders",
//       },
//     },
//   });
// export const getAllMaterials = () =>
//   materialGroupModel.find().populate({
//     path: "materialnames",
//     populate: {
//       path: "materialgrades",
//       populate: {
//         path: "materialproviders",
//       },
//     },
//   });
// export const getAllMaterialProviders = () =>
//   MaterialProviderModel.find()
//     .populate("records.materialgroup")
//     .populate("records.materialname")
//     .populate("records.materialgrade");
export const getAllPartProviders = () =>
  PartProviderModel.find()
    .populate({
      path: "records.partgroup",
      model: "PartGroups", // Ensures that Mongoose knows which model to use for population
    })
    .populate({
      path: "records.partname",
      model: "PartNames", // Similarly, define the model for material names
    })
    .populate({
      path: "records.partgeneralid",
      model: "PartGeneralIds", // And for material grades
    })
    .exec();

export const getAll = async (req: express.Request, res: express.Response) => {
  try {
    const materialGroups = await getMaterialGroups();
    const materialNames = await getMaterialNames();
    const materialGrades = await getMaterialGrades();
    const partGroups = await getPartGroups();
    const partNames = await getPartNames();
    const partGeneralIds = await getPartGeneralIds();
    const materialProviders = await getMaterialProviders();
    const partProviders = await getAllPartProviders();
    const allArray = {
      materialProviders,
      partProviders,
      materialGrades,
      materialGroups,
      materialNames,
      partGroups,
      partNames,
      partGeneralIds,
    };
    return res.status(200).json(allArray);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
