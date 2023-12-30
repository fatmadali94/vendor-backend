import express from "express";
import {
  getAllPartGroups,
  getPartGroup,
  deletePartGroup,
  updatePartGroup,
  createPartGroup,
} from "../../controllers/parts/partGroups";

export default (router: express.Router) => [
  router.get("/partGroups", getAllPartGroups),
  router.get("/partGroup/:id", getPartGroup),
  router.delete(
    "/partGroup/:id",

    deletePartGroup
  ),
  router.patch("/partGroup/:id", updatePartGroup),
  router.post("/createPartGroup", createPartGroup),
];
