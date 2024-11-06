import express from "express";
import { leaveComment } from "../controllers/comments";

export default (router: express.Router) => [
  router.post("/createComment", leaveComment),
];
