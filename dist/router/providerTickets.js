"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const providerTickets_1 = require("../controllers/providerTickets");
exports.default = (router) => [
    router.get("/providerTickets", providerTickets_1.getAllProviderTickets),
    router.post("/createProviderTicket", providerTickets_1.createProviderTicket),
    router.get("/providerTickets/:providerId", providerTickets_1.getProviderTicket),
    router.patch("/providerTickets/:ticketId", providerTickets_1.updateProviderTicket),
];
