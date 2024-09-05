import express from "express";
var mongoose = require("mongoose");
import { getProducts, deleteProductById, getProductById } from "../db/products";
import { productModel } from "../db/products";

const cloudinary = require("../utils/cloudinary");

export const getAllProducts = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const products = await getProducts();
    return res.status(200).json(products);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const deleteProduct = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deletedProduct: any = await deleteProductById(id);
    if (deletedProduct.image) {
      const imgId = deletedProduct.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    return res.status(200).json("Product got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const createProduct = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "products",
    });
    // const url = req.protocol + "://" + req.get("host");
    const newProduct = new productModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      // url + "/subcategory/" + (req as unknown as MulterRequest).file.filename,
    });

    await newProduct.save();
    return res.status(200).json(newProduct).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

export const getProduct = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    return res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
