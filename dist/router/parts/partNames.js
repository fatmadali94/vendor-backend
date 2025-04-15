"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const partNames_1 = require("../../controllers/parts/partNames");
exports.default = (router) => [
    router.get("/partNames", partNames_1.getAllPartNames),
    router.delete("/partName/:id", partNames_1.deletePartName),
    router.post("/createPartName", partNames_1.createPartName),
    router.patch("/partName/:id", partNames_1.updatePartName),
    // router.get("/materialName/:id", getMaterialName),
];
