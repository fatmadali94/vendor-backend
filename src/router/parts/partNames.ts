import express from "express";
import {
  getAllPartNames,
  deletePartName,
  createPartName,
  updatePartName,
  // getMaterialName,
} from "../../controllers/parts/partNames";

export default (router: express.Router) => [
  router.get("/partNames", getAllPartNames),
  router.delete("/partName/:id", deletePartName),
  router.post("/createPartName", createPartName),
  router.patch("/partName/:id", updatePartName),
  // router.get("/materialName/:id", getMaterialName),
];
