import express from "express";
import {
  getAllMarketInfo,
  deleteMarketInfo,
  createMarketInfo,
  getMarketInfo,
} from "../controllers/marketInformation";

export default (router: express.Router) => [
  router.get("/markets", getAllMarketInfo),
  router.delete("/market/:id", deleteMarketInfo),
  router.post("/createMarket", createMarketInfo),
  router.get("/market/:id", getMarketInfo),
];
