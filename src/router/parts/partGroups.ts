import express from "express";
import {
  getAllPartGroups,
  deletePartGroup,
  createPartGroup,
  // getMaterialGroup,
  // updateMaterialGroup,
} from "../../controllers/parts/partGroups";

export default (router: express.Router) => [
  router.get("/partGroups", getAllPartGroups),
  router.delete("/partGroup/:id", deletePartGroup),
  router.post("/createPartGroup", createPartGroup),
  // router.patch("/materialGroup/:id", updateMaterialGroup),
  // router.get("/materialGroup/:id", getMaterialGroup),
];
