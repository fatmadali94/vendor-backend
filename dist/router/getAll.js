"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collections_1 = require("../controllers/collections");
exports.default = (router) => [router.get("/getAll", collections_1.getAll)];
