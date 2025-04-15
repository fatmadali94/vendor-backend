"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const materialGrades_1 = require("../../controllers/materials/materialGrades");
exports.default = (router) => [
    router.get("/materialGrades", materialGrades_1.getAllMaterialGrades),
    router.delete("/materialGrade/:id", materialGrades_1.deleteMaterialGrade),
    router.post("/createMaterialGrade", materialGrades_1.createMaterialGrade),
    // router.patch("/materialGrade/:id", updateMaterialGrade),
    // router.get("/materialGrade/:id", getMaterialGrade),
];
