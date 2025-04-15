"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductById = exports.getProductById = exports.getProducts = exports.productModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ProductSchema = new mongoose_1.default.Schema({
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
exports.productModel = mongoose_1.default.model("Products", ProductSchema);
const getProducts = () => exports.productModel.find();
exports.getProducts = getProducts;
const getProductById = (id) => exports.productModel.findById(id);
exports.getProductById = getProductById;
const deleteProductById = (id) => exports.productModel.findOneAndDelete({ _id: id });
exports.deleteProductById = deleteProductById;
//
