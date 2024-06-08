import express from "express";
import { getMessages, createMessage } from "../controllers/messages/messages";

export default (router: express.Router) => [
  router.get("/messages", getMessages),
  router.post("/createMessage", createMessage),
];
