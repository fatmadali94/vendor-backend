import express from "express";
import {
  getAllResources,
  deleteResource,
  createResource,
  getResource,
} from "../controllers/resourceCenter";

export default (router: express.Router) => [
  router.get("/resources", getAllResources),
  router.delete("/resource/:id", deleteResource),
  router.post("/createResource", createResource),
  router.get("/resource/:id", getResource),
];
