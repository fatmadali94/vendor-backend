import express from "express";
import { partGroupModel } from "../db/parts/partGroups";
import { materialGroupModel } from "../db/materials/materialGroups";
import { PartProviderModel } from "../db/parts/partProviders";
import { partGeneralIdModel } from "../db/parts/partGeneralIds";
import { materialGradeModel } from "../db/materials/materialGrades";
import { MaterialProviderModel } from "../db/materials/materialProviders";

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
export const getAllMaterialProviders = () =>
  MaterialProviderModel.find()
    .populate({ path: "materialgrades", select: "title" })
    .populate({ path: "materialgroups", select: "title" })
    .populate({ path: "materialnames", select: "title" });
export const getAllPartProviders = () =>
  PartProviderModel.find()
    .populate({ path: "partgeneralids", select: "title" })
    .populate({ path: "partnames", select: "title" })
    .populate({ path: "partgroups", select: "title" });

export const getAll = async (req: express.Request, res: express.Response) => {
  try {
    // const parts = await getAllParts();
    // console.log(parts);

    // const materials = await getAllMaterials();
    // console.log(materials);
    const materialProviders = await getAllMaterialProviders();
    const partProviders = await getAllPartProviders();
    // console.log(materialproviders);
    const allArray = {
      materialProviders,
      partProviders,
    };

    // return res.status(200).json(collections);
    return res.status(200).json(allArray);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
