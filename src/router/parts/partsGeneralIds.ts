import express from "express";
import {
  getAllPartsGeneralIds,
  getPartsGeneralId,
  deletePartsGeneralId,
  updatePartsGeneralId,
  createPartsGeneralId,
} from "../../controllers/parts/partGeneralIds";

export default (router: express.Router) => [
  router.get("/partsGeneralIds", getAllPartsGeneralIds),
  router.get("/partGeneralId/:id", getPartsGeneralId),
  router.delete(
    "/partGeneralId/:id",

    deletePartsGeneralId
  ),
  router.patch("/partGeneralId/:id", updatePartsGeneralId),
  router.post("/createPartGeneralId", createPartsGeneralId),
];
