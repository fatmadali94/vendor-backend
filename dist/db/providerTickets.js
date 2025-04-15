"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderTicket = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const providerTicketSchema = new mongoose_1.default.Schema({
    provider: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Provider", required: true },
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
exports.ProviderTicket = mongoose_1.default.model("ProviderTicket", providerTicketSchema);
