import express from "express";
import {
  getAllPartProviders,
  deletePartProvider,
  updatePartProvider,
  createPartProvider,
  getPartProvider,
} from "../../controllers/parts/partProviders";

export default (router: express.Router) => [
  router.get("/partProviders", getAllPartProviders),
  router.get("/partProvider/:id", getPartProvider),
  router.delete("/partProvider/:id", deletePartProvider),
  router.patch("/partProvider/:id", updatePartProvider),
  router.post("/createPartProvider", createPartProvider),
];
