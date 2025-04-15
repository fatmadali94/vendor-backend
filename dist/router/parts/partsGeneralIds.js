"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const partGeneralIds_1 = require("../../controllers/parts/partGeneralIds");
exports.default = (router) => [
    router.get("/partGeneralIds", partGeneralIds_1.getAllPartGeneralIds),
    router.delete("/partGeneralId/:id", partGeneralIds_1.deletePartGeneralId),
    router.post("/createPartGeneralId", partGeneralIds_1.createPartGeneralId),
];
