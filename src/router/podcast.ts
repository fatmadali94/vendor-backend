import express from "express";
import {
  createPodcast,
  getAllPodcast,
  getSinglePodcast,
  updatePodcast,
  deletePodcast,
} from "../controllers/podcast"; // ✅ Correct import

export default (router: express.Router) => [


router.get("/api/podcasts", getAllPodcast),
router.post("/api/podcasts", createPodcast),
router.get("/podcast/:id", getSinglePodcast),
router.put("/podcast/:id", updatePodcast),
router.delete("/podcast/:id", deletePodcast),
]