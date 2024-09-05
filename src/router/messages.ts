import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  getSentMessages,
  getReceivedMessages,
  respondToMessage,
  sendMessage,
} from "../controllers/messages";

export default (router: express.Router) => [
  router.get("/sent-messages", protect, getSentMessages),
  router.get("/received-messages", protect, getReceivedMessages),
  router.post("/:id/respond-message", protect, respondToMessage),
  router.post("/message", protect, sendMessage),
];
