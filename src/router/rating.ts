import express from "express";
import { leaveRating } from "../controllers/rating";

export default (router: express.Router) => [
  router.post("/createRating", leaveRating),
];
