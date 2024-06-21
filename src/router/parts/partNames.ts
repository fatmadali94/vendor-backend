import express from "express";
import {
  getAllPartNames,
  deletePartName,
  createPartName,
  // updateMaterialName,
  // getMaterialName,
} from "../../controllers/parts/partNames";

export default (router: express.Router) => [
  router.get("/partNames", getAllPartNames),
  router.delete("/partName/:id", deletePartName),
  router.post("/createPartName", createPartName),
  // router.patch("/materialName/:id", updateMaterialName),
  // router.get("/materialName/:id", getMaterialName),
];
