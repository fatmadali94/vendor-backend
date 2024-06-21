import express from "express";
import {
  getAllMaterialNames,
  // getMaterialName,
  deleteMaterialName,
  // updateMaterialName,
  createMaterialName,
} from "../../controllers/materials/materialNames";

export default (router: express.Router) => [
  router.get("/materialNames", getAllMaterialNames),
  router.delete("/materialName/:id", deleteMaterialName),
  router.post("/createMaterialName", createMaterialName),
  // router.patch("/materialName/:id", updateMaterialName),
  // router.get("/materialName/:id", getMaterialName),
];
