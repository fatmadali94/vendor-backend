import express from "express";
import {
  getAllUserTickets,
  createUserTicket,
  getUserTicket,
  updateUserTicket,
} from "../controllers/userTickets";

export default (router: express.Router) => [
  router.get("/userTickets", getAllUserTickets),
  router.post("/createUserTicket", createUserTicket),
  router.get("/userTickets/:userId", getUserTicket),
  router.patch("/userTickets/:ticketId", updateUserTicket),
];
