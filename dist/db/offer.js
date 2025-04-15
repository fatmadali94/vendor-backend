"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffers = exports.OfferModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const OfferSchema = new mongoose_1.default.Schema({
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
    title: { type: String, required: false },
    name: { type: String, required: false },
    description: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: Number, required: false },
}, {
    timestamps: true,
});
exports.OfferModel = mongoose_1.default.model("Offer", OfferSchema);
const getOffers = () => exports.OfferModel.find();
exports.getOffers = getOffers;
