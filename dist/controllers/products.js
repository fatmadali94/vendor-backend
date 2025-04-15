"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProduct = exports.createProduct = exports.deleteProduct = exports.getAllProducts = void 0;
var mongoose = require("mongoose");
const products_1 = require("../db/products");
const products_2 = require("../db/products");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield (0, products_1.getProducts)();
        return res.status(200).json(products);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllProducts = getAllProducts;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedProduct = yield (0, products_1.deleteProductById)(id);
        if (deletedProduct.image) {
            const imgId = deletedProduct.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
        }
        return res.status(200).json("Product got deleted").end();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.deleteProduct = deleteProduct;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "products",
        });
        // const url = req.protocol + "://" + req.get("host");
        const newProduct = new products_2.productModel(Object.assign(Object.assign({}, req.body), { image: {
                public_id: result.public_id,
                url: result.secure_url,
            } }));
        yield newProduct.save();
        return res.status(200).json(newProduct).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createProduct = createProduct;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield (0, products_1.getProductById)(id);
        return res.status(200).json(product);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.getProduct = getProduct;
