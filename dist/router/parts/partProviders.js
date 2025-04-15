"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const partProviders_1 = require("../../controllers/parts/partProviders");
exports.default = (router) => [
    router.get("/partProviders", partProviders_1.getAllPartProviders),
    router.get("/partProvider/:id", partProviders_1.getPartProvider),
    router.delete("/partProvider/:id", partProviders_1.deletePartProvider),
    router.patch("/partProvider/:id", partProviders_1.updatePartProvider),
    router.post("/createPartProvider", partProviders_1.createPartProvider),
];
