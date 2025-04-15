import express from "express";
import {
  getAllDigitalMagazine,
  deleteMagazine,
  createMagazine,
  getSingleMagazine,
  updateMagazine,
} from "../controllers/digitalMagazine"; // ✅ Correct import

export default (router: express.Router) => [


router.get("/api/digitalMagazines", getAllDigitalMagazine),
router.post("/api/digitalMagazines", createMagazine),
router.get("/digitalMagazine/:id", getSingleMagazine),
// ✅ UPDATE a Digital Magazine
router.put("/digitalMagazines/:id", updateMagazine),

// ✅ DELETE a Digital Magazine
router.delete("/digitalMagazines/:id", deleteMagazine),
]

