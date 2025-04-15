"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const materialProviders_1 = require("../../controllers/materials/materialProviders");
exports.default = (router) => [
    router.get("/materialProviders", materialProviders_1.getAllMaterialProviders),
    router.get("/materialProvider/:id", materialProviders_1.getMaterialProvider),
    router.delete("/materialProvider/:id", materialProviders_1.deleteProvider),
    router.patch("/materialProvider/:id", materialProviders_1.updateProvider),
    router.post("/createMaterialProvider", materialProviders_1.createProvider),
];
