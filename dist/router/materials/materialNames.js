"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const materialNames_1 = require("../../controllers/materials/materialNames");
exports.default = (router) => [
    router.get("/materialNames", materialNames_1.getAllMaterialNames),
    router.delete("/materialName/:id", materialNames_1.deleteMaterialName),
    router.post("/createMaterialName", materialNames_1.createMaterialName),
    router.patch("/materialName/:id", materialNames_1.updateMaterialName),
    // router.get("/materialName/:id", getMaterialName),
];
