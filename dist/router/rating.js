"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rating_1 = require("../controllers/rating");
exports.default = (router) => [
    router.post("/createRating", rating_1.leaveRating),
];
