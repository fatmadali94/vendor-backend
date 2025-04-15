"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resourceCenter_1 = require("../controllers/resourceCenter");
exports.default = (router) => [
    router.get("/resources", resourceCenter_1.getAllResources),
    router.delete("/resource/:id", resourceCenter_1.deleteResource),
    router.post("/createResource", resourceCenter_1.createResource),
    router.get("/resource/:id", resourceCenter_1.getResource),
];
