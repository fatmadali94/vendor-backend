import express from "express";
import {
  getAllMaterialGrades,
  // getMaterialGrade,
  deleteMaterialGrade,
  // updateMaterialGrade,
  createMaterialGrade,
} from "../../controllers/materials/materialGrades";

export default (router: express.Router) => [
  router.get("/materialGrades", getAllMaterialGrades),
  router.delete("/materialGrade/:id", deleteMaterialGrade),
  router.post("/createMaterialGrade", createMaterialGrade),
  // router.patch("/materialGrade/:id", updateMaterialGrade),
  // router.get("/materialGrade/:id", getMaterialGrade),
];
