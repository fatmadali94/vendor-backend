import express from "express";
import {
  getAllProviders,
  deleteProvider,
  updateProvider,
  createProvider,
  getProvider,
} from "../../controllers/parts/partProviders";

export default (router: express.Router) => [
  router.get("/partProviders", getAllProviders),
  router.get("/partProvider/:id", getProvider),
  router.delete("/partProvider/:id", deleteProvider),
  router.patch("/partProvider/:id", updateProvider),
  router.post("/createPartProvider", createProvider),
];
