import express from "express";
import {
  getAllPartNames,
  getPartName,
  deletePartName,
  updatePartName,
  createPartName,
} from "../../controllers/parts/partNames";

export default (router: express.Router) => [
  router.get("/partNames", getAllPartNames),
  router.get("/partName/:id", getPartName),
  router.delete(
    "/partName/:id",

    deletePartName
  ),
  router.patch("/partName/:id", updatePartName),
  router.post("/createPartName", createPartName),
];
