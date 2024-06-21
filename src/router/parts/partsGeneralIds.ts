import express from "express";
import {
  getAllPartGeneralIds,
  deletePartGeneralId,
  createPartGeneralId,
} from "../../controllers/parts/partGeneralIds";

export default (router: express.Router) => [
  router.get("/partGeneralIds", getAllPartGeneralIds),
  router.delete("/partGeneralId/:id", deletePartGeneralId),
  router.post("/createPartGeneralId", createPartGeneralId),
];
