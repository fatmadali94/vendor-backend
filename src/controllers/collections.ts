import express from "express";
import { PartProviderModel, getPartProviders } from "../db/parts/partProviders";
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
import { getProducts } from "../db/products";
import { getVerifiedMaterialProviders, getVerifiedPartProviders } from "../db/providers";

export const getAll = async (req: express.Request, res: express.Response) => {
  try {
    const materialGroups = await getMaterialGroups();
    const materialNames = await getMaterialNames();
    const materialGrades: any = await getMaterialGrades();
    const partGroups = await getPartGroups();
    const partNames = await getPartNames();
    const partGeneralIds = await getPartGeneralIds();
    const materialProviders = await getMaterialProviders();
    const partProviders = await getPartProviders();
    const products = await getProducts();
    const verifiedMaterialProviders = await getVerifiedMaterialProviders();
    const verifiedPartProviders = await getVerifiedPartProviders();

    const allArray = {
      materialProviders,
      partProviders,
      materialGrades,
      materialGroups,
      materialNames,
      partGroups,
      partNames,
      partGeneralIds,
      products,
      verifiedMaterialProviders,
      verifiedPartProviders,
    };
    return res.status(200).json(allArray);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
