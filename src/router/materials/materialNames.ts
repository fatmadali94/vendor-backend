import express from "express";
import {
  getAllMaterialNames,
  getMaterialName,
  deleteMaterialName,
  updateMaterialName,
  createMaterialName,
} from "../../controllers/materials/materialNames";

export default (router: express.Router) => [
  router.get("/materialNames", getAllMaterialNames),
  router.get("/materialName/:id", getMaterialName),
  router.delete(
    "/materialName/:id",

    deleteMaterialName
  ),
  router.patch("/materialName/:id", updateMaterialName),
  router.post("/createMaterialName", createMaterialName),
];
