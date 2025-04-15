"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceCenterModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ResourceCenterSchema = new mongoose_1.default.Schema({
    image: {
        public_id: {
            type: String,
            required: false,
        },
        url: {
            type: String,
            required: false,
        },
    },
    slug: { type: String, required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
}, {
    timestamps: true,
});
exports.ResourceCenterModel = mongoose_1.default.model("Resources", ResourceCenterSchema);
