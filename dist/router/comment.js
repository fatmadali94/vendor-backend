"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comments_1 = require("../controllers/comments");
exports.default = (router) => [
    router.post("/createComment", comments_1.leaveComment),
];
