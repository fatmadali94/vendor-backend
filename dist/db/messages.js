"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MessageSchema = new mongoose_1.default.Schema({
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    recipient: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Provider",
        required: false,
    },
    content: { type: String, required: true },
    subject: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    response: { type: String },
    responseTimestamp: { type: Date },
});
exports.MessageModel = mongoose_1.default.model("Message", MessageSchema);
exports.default = MessageSchema; // Use this in other schemas as a subdocument
