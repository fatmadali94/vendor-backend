import express from "express";
import {
  getAllMaterialProviders,
  deleteProvider,
  updateProvider,
  createProvider,
  getMaterialProvider,
} from "../../controllers/materials/materialProviders";

export default (router: express.Router) => [
  router.get("/materialProviders", getAllMaterialProviders),
  router.get("/materialProvider/:id", getMaterialProvider),
  router.delete("/materialProvider/:id", deleteProvider),
  router.patch("/materialProvider/:id", updateProvider),
  router.post("/createMaterialProvider", createProvider),
];
