import express from "express";
import {
  getAllProducts,
  deleteProduct,
  createProduct,
  getProduct,
} from "../controllers/products";

export default (router: express.Router) => [
  router.get("/products", getAllProducts),
  router.delete("/product/:id", deleteProduct),
  router.post("/createProduct", createProduct),
  router.get("/product/:id", getProduct),

  // router.patch("/materialName/:id", updateMaterialName),
  // router.get("/materialName/:id", getMaterialName),
];
