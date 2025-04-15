"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marketInformation_1 = require("../controllers/marketInformation");
exports.default = (router) => [
    router.get("/markets", marketInformation_1.getAllMarketInfo),
    router.delete("/market/:id", marketInformation_1.deleteMarketInfo),
    router.post("/createMarket", marketInformation_1.createMarketInfo),
    router.get("/market/:id", marketInformation_1.getMarketInfo),
];
