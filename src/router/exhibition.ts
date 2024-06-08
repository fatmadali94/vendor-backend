import express from "express";
import {
  getAllExhibitions,
  getExhibition,
  deleteExhibition,
  updateExhibition,
  createExhibition,
} from "../controllers/exhibitions/exhibitions";

export default (router: express.Router) => [
  router.get("/exhibitions", getAllExhibitions),
  router.get("/exhibitions/:id", getExhibition),
  router.delete("/exhibition/:id", deleteExhibition),
  router.patch("/exhibitions/:id", updateExhibition),
  router.post("/createExhibition", createExhibition),
];
