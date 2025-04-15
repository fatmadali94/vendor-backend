"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const products_1 = require("../controllers/products");
exports.default = (router) => [
    router.get("/products", products_1.getAllProducts),
    router.delete("/product/:id", products_1.deleteProduct),
    router.post("/createProduct", products_1.createProduct),
    router.get("/product/:id", products_1.getProduct),
    // router.patch("/materialName/:id", updateMaterialName),
    // router.get("/materialName/:id", getMaterialName),
];
