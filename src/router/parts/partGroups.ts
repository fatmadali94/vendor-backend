import express from "express";
import {
  getAllPartGroups,
  deletePartGroup,
  createPartGroup,
  // getMaterialGroup,
  updatePartGroup,
} from "../../controllers/parts/partGroups";

export default (router: express.Router) => [
  router.get("/partGroups", getAllPartGroups),
  router.delete("/partGroup/:id", deletePartGroup),
  router.post("/createPartGroup", createPartGroup),
  router.patch("/partGroup/:id", updatePartGroup),
  // router.get("/materialGroup/:id", getMaterialGroup),
];
