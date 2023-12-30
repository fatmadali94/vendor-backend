import express from "express";
import { registerUser, loginUser } from "../controllers/auth";

export default (router: express.Router) => [
  router.post("/users/register", registerUser),
  router.post("/users/login", loginUser),
];
