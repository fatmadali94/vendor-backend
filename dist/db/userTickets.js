"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTicket = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userTicketSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["pending", "closed"], default: "pending" },
    adminResponse: { type: String, default: "" },
    image: {
        public_id: { type: String, default: null },
        url: { type: String, default: null },
        originalFileName: { type: String, default: null },
    },
}, { timestamps: true });
exports.UserTicket = mongoose_1.default.model("UserTicket", userTicketSchema);
