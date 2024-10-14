import express from "express";
import {
  getAllTickets,
  createTicket,
  getTicket,
  updateTicket,
} from "../controllers/tickets";

export default (router: express.Router) => [
  router.get("/tickets", getAllTickets),
  router.post("/createTicket", createTicket),
  router.get("/tickets/:userId", getTicket),
  router.patch("/tickets/:ticketId", updateTicket),
];
