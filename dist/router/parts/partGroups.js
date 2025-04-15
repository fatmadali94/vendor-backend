"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const partGroups_1 = require("../../controllers/parts/partGroups");
exports.default = (router) => [
    router.get("/partGroups", partGroups_1.getAllPartGroups),
    router.delete("/partGroup/:id", partGroups_1.deletePartGroup),
    router.post("/createPartGroup", partGroups_1.createPartGroup),
    router.patch("/partGroup/:id", partGroups_1.updatePartGroup),
    // router.get("/materialGroup/:id", getMaterialGroup),
];
