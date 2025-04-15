"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const materialGroups_1 = require("../../controllers/materials/materialGroups");
exports.default = (router) => [
    router.get("/materialGroups", materialGroups_1.getAllMaterialGroups),
    // router.get("/materialGroup/:id", getMaterialGroup),
    router.delete("/materialGroup/:id", materialGroups_1.deleteMaterialGroup),
    router.patch("/materialGroup/:id", materialGroups_1.updateMaterialGroup),
    router.post("/createMaterialGroup", materialGroups_1.createMaterialGroup),
];
