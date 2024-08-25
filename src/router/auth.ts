import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  registerProvider,
  loginProvider,
  verifyUser,
  resendVerificationCode,
  resendProviderVerificationCode,
  verifyProvider,
} from "../controllers/auth";
import { protect, authorize } from "../middlewares/authMiddleware";

export default (router: express.Router) => [
  // Route to register a new user
  router.post("/user-register", registerUser),
  router.post("/verify-user", verifyUser),
  router.post("/resend-verify-user", resendVerificationCode),
  router.post("/user-login", loginUser),

  // PROVIDERS ROUTES
  router.post("/provider-register", registerProvider),
  router.post("/verify-provider", verifyProvider),
  router.post("/resend-verify-provider", resendProviderVerificationCode),
  router.post("/provider-login", loginProvider),

  // Route to login a user

  // Route to get the current user's profile
  router.get("/me", protect, getMe),

  // Protected route accessible only by admin users
  router.get("/auth/admin", protect, authorize("admin"), (req, res) => {
    res.json({ message: "Admin content" });
  }),

  // Protected route accessible only by provider users
  router.get("/auth/provider", protect, authorize("provider"), (req, res) => {
    res.json({ message: "Provider content" });
  }),

  // Protected route accessible only by regular users
  router.get("/auth/user", protect, authorize("user"), (req, res) => {
    res.json({ message: "User content" });
  }),
];
