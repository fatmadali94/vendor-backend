"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../middlewares/authMiddleware");
const messages_1 = require("../controllers/messages");
exports.default = (router) => [
    router.get("/sent-messages", authMiddleware_1.protect, messages_1.getSentMessages),
    router.get("/received-messages", authMiddleware_1.protect, messages_1.getReceivedMessages),
    router.post("/:id/respond-message", authMiddleware_1.protect, messages_1.respondToMessage),
    router.post("/message", messages_1.sendMessage),
];
