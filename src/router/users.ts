import {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} from "./verifyToken";
import express from "express";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  getUserStats,
  getUser,
} from "../controllers/users";

export default (router: express.Router) => [
  // router.get("/users", isAuthenticated, getAllUsers),
  // router.delete("/users/:id", isAuthenticated, isOwner, deleteUser),
  // router.patch("/users/:id", isAuthenticated, isOwner, updateUser),
  router.put("/users/:id", verifyTokenAndAuthorization, updateUser),
  router.delete("/users/:id", verifyTokenAndAuthorization, deleteUser),
  router.get("/users/find/:id", verifyTokenAndAdmin, getUser),
  router.get("/users", verifyTokenAndAdmin, getAllUsers),
  router.get("/users/stats", verifyTokenAndAdmin, getUserStats),
];
