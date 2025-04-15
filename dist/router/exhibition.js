"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exhibitions_1 = require("../controllers/exhibitions/exhibitions");
exports.default = (router) => [
    router.get("/exhibitions", exhibitions_1.getAllExhibitions),
    router.get("/exhibitions/:id", exhibitions_1.getExhibition),
    router.delete("/exhibition/:id", exhibitions_1.deleteExhibition),
    router.patch("/exhibitions/:id", exhibitions_1.updateExhibition),
    router.post("/createExhibition", exhibitions_1.createExhibition),
];
