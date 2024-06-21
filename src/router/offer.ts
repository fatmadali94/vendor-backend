import express from "express";
import { createOffer, getAllOffers } from "../controllers/offer";

export default (router: express.Router) => [
  router.get("/offers", getAllOffers),
  router.post("/createOffer", createOffer),
];
