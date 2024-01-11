import express from "express";
import { getAll } from "../controllers/collections";

export default (router: express.Router) => [router.get("/getAll", getAll)];
