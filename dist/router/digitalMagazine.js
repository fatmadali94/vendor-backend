"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const digitalMagazine_1 = require("../controllers/digitalMagazine"); // ✅ Correct import
exports.default = (router) => [
    router.get("/api/digitalMagazines", digitalMagazine_1.getAllDigitalMagazine),
    router.post("/api/digitalMagazines", digitalMagazine_1.createMagazine),
    router.get("/digitalMagazine/:id", digitalMagazine_1.getSingleMagazine),
    // ✅ UPDATE a Digital Magazine
    router.put("/digitalMagazines/:id", digitalMagazine_1.updateMagazine),
    // ✅ DELETE a Digital Magazine
    router.delete("/digitalMagazines/:id", digitalMagazine_1.deleteMagazine),
];
