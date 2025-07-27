"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const podcast_1 = require("../controllers/podcast"); // ✅ Correct import
exports.default = (router) => [
    router.get("/api/podcasts", podcast_1.getAllPodcast),
    router.post("/api/podcasts", podcast_1.createPodcast),
    router.get("/podcast/:id", podcast_1.getSinglePodcast),
    router.put("/podcast/:id", podcast_1.updatePodcast),
    router.delete("/podcast/:id", podcast_1.deletePodcast),
];
