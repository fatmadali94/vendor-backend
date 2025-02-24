import express from "express";
import {
  getAllProviderTickets,
  createProviderTicket,
  getProviderTicket,
  updateProviderTicket,
} from "../controllers/providerTickets";

export default (router: express.Router) => [
  router.get("/providerTickets", getAllProviderTickets),
  router.post("/createProviderTicket", createProviderTicket),
  router.get("/providerTickets/:providerId", getProviderTicket),
  router.patch("/providerTickets/:ticketId", updateProviderTicket),
];
