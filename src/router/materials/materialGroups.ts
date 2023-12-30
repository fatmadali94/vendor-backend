import express from "express";
import {
  getAllMaterialGroups,
  getMaterialGroup,
  deleteMaterialGroup,
  updateMaterialGroup,
  createMaterialGroup,
} from "../../controllers/materials/materialGroups";

export default (router: express.Router) => [
  router.get("/materialGroups", getAllMaterialGroups),
  router.get("/materialGroup/:id", getMaterialGroup),
  router.delete(
    "/materialGroup/:id",

    deleteMaterialGroup
  ),
  router.patch("/materialGroup/:id", updateMaterialGroup),
  router.post("/createMaterialGroup", createMaterialGroup),
];
