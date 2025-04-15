"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const offer_1 = require("../controllers/offer");
exports.default = (router) => [
    router.get("/offers", offer_1.getAllOffers),
    router.post("/createOffer", offer_1.createOffer),
];
