import express from "express";
import {
  getAllProviders,
  deleteProvider,
  updateProvider,
  createProvider,
  getProvider,
} from "../../controllers/materials/materialProviders";

export default (router: express.Router) => [
  router.get("/materialProviders", getAllProviders),
  router.get("/materialProvider/:id", getProvider),
  router.delete("/materialProvider/:id", deleteProvider),
  router.patch("/materialProvider/:id", updateProvider),
  router.post("/createMaterialProvider", createProvider),
];
