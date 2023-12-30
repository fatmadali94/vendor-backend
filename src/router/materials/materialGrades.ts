import express from "express";
import {
  getAllMaterialGrades,
  getMaterialGrade,
  deleteMaterialGrade,
  updateMaterialGrade,
  createMaterialGrade,
} from "../../controllers/materials/materialGrades";

export default (router: express.Router) => [
  router.get("/materialGrades", getAllMaterialGrades),
  router.get("/materialGrade/:id", getMaterialGrade),
  router.delete(
    "/materialGrade/:id",

    deleteMaterialGrade
  ),
  router.patch("/materialGrade/:id", updateMaterialGrade),
  router.post("/createMaterialGrade", createMaterialGrade),
];
