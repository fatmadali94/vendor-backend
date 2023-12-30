import express from "express";
import { getAllCollections } from "../controllers/collections";

export default (router: express.Router) => [
  router.get("/getAllCollections", getAllCollections),
];
