"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userTickets_1 = require("../controllers/userTickets");
exports.default = (router) => [
    router.get("/userTickets", userTickets_1.getAllUserTickets),
    router.post("/createUserTicket", userTickets_1.createUserTicket),
    router.get("/userTickets/:userId", userTickets_1.getUserTicket),
    router.patch("/userTickets/:ticketId", userTickets_1.updateUserTicket),
];
