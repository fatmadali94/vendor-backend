"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = require("../controllers/users");
const providers_1 = require("../controllers/providers");
const auth_1 = require("../controllers/auth");
const authMiddleware_1 = require("../middlewares/authMiddleware");
exports.default = (router) => [
    // Route to register a new user
    router.post("/user-register", users_1.registerUser),
    router.post("/verify-user", users_1.verifyUser),
    router.post("/resend-verify-user", users_1.resendUserVerificationCode),
    router.post("/user-login", users_1.loginUser),
    router.patch("/user-update", users_1.updateUser),
    router.post("/remove-unverified-user", users_1.removeUnverifiedUser),
    router.get("/get-users", users_1.getAllUsers),
    router.post("/user-upload-file", users_1.uploadUserFile),
    router.post("/forgot-password", users_1.userForgotPassword),
    router.post("/reset-password", users_1.userResetPassword),
    router.put("/update-profile-image", users_1.updateUserImage),
    // PROVIDERS ROUTES
    router.post("/provider-register", providers_1.registerProvider),
    router.post("/verify-provider", providers_1.verifyProvider),
    router.post("/resend-verify-provider", providers_1.resendProviderVerificationCode),
    router.post("/provider-login", providers_1.loginProvider),
    router.patch("/provider-update", providers_1.updateProvider),
    router.get("/verifiedProvider/:id", providers_1.getVerifiedProvider),
    router.post("/remove-unverified-provider", providers_1.removeUnverifiedProvider),
    router.get("/get-providers", providers_1.getAllProviders),
    router.post("/provider-upload-file", providers_1.uploadProviderFile),
    router.post("/provider-delete-file", providers_1.deleteUploadedFile),
    // router.put("/update-profile-image", updateProviderImage),
    // router.put("/update-profile-record", updateProviderRecords),  
    // router.get("/verified-providers", getAllVerifiedProviders),
    // Route to login a user
    // Route to get the current user's profile
    router.get("/me", authMiddleware_1.protect, auth_1.getMe),
    // Protected route accessible only by admin users
    router.get("/auth/admin", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("admin"), (req, res) => {
        res.json({ message: "Admin content" });
    }),
    // Protected route accessible only by provider users
    router.get("/auth/provider", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("provider"), (req, res) => {
        res.json({ message: "Provider content" });
    }),
    // Protected route accessible only by regular users
    router.get("/auth/user", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("user"), (req, res) => {
        res.json({ message: "User content" });
    }),
];
