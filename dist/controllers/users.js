"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserImage = exports.updateUser = exports.userResetPassword = exports.userForgotPassword = exports.loginUser = exports.removeUnverifiedUser = exports.resendUserVerificationCode = exports.verifyUser = exports.registerUser = exports.getAllUsers = exports.uploadUserFile = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("../db/users"));
const crypto_1 = __importDefault(require("crypto"));
const unverifiedUsers_1 = __importDefault(require("../db/unverifiedUsers"));
const emailService_1 = require("./emailService");
const helpers_1 = require("../utils/helpers");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const smsService_1 = require("./smsService");
dotenv_1.default.config();
const uploadUserFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { file, userId, originalFilename } = req.body;
        if (!file) {
            return res.status(400).json({ message: "File is required" });
        }
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const fileType = file.split(";")[0].split("/")[1].toLowerCase();
        let uploadOptions = {
            folder: `user_uploads/${userId}`,
        };
        if (fileType === "pdf") {
            uploadOptions.resource_type = "raw";
        }
        const result = yield cloudinary_1.default.uploader.upload(file, uploadOptions);
        const user = yield users_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const newFile = {
            public_id: result.public_id,
            url: result.secure_url,
            filename: result.original_filename,
            fileType,
            originalFilename: originalFilename,
        };
        // Add the uploaded file to the user's uploadedFiles array
        user.uploadedFiles = user.uploadedFiles || [];
        user.uploadedFiles.push(newFile);
        yield user.save();
        res
            .status(200)
            .json({ message: "File uploaded successfully", file: newFile });
    }
    catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});
exports.uploadUserFile = uploadUserFile;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield users_1.default.find();
        return res.status(200).json(users);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllUsers = getAllUsers;
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    console.log("🟢 Incoming registration data:", data);
    try {
        const verificationCode = crypto_1.default.randomBytes(3).toString("hex");
        console.log("🔐 Generated verification code:", verificationCode);
        const hashedPassword = yield (0, helpers_1.hashPassword)(data.password);
        console.log("🔐 Hashed password created");
        let newUserData = Object.assign(Object.assign({}, data), { password: hashedPassword, verificationCode });
        // Upload image if provided
        if (req.body.image) {
            console.log("🖼 Uploading image to Cloudinary...");
            const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
                folder: "verifiedUsers",
            });
            console.log("✅ Image uploaded:", result.secure_url);
            newUserData = Object.assign(Object.assign({}, newUserData), { image: {
                    public_id: result.public_id,
                    url: result.secure_url,
                } });
        }
        const existingUser = yield users_1.default.findOne({ email: newUserData.email });
        if (existingUser) {
            console.warn("⚠️ User already registered:", newUserData.email);
            return res.status(409).json({ message: "کاربر ثبت شده است" });
        }
        const existingUnverifiedUser = yield unverifiedUsers_1.default.findOne({
            email: newUserData.email,
        });
        if (existingUnverifiedUser) {
            console.warn("⚠️ Unverified user already exists:", newUserData.email);
            return res.status(409).json({
                message: "درخواست شما قبلا ثبت شده است لطفا کد را وارد یا درخواست کد جدید دهید",
            });
        }
        const unverifiedUser = new unverifiedUsers_1.default(newUserData);
        yield unverifiedUser.save();
        console.log("✅ Unverified user saved to DB:", newUserData.email);
        // ✅ Send email
        console.log("📧 Sending verification email...");
        yield (0, emailService_1.sendVerificationEmail)(unverifiedUser.email, verificationCode);
        console.log("✅ Email sent to:", unverifiedUser.email);
        // Try SMS but don't fail the whole request if it errors
        let smsSent = false;
        if (unverifiedUser.cellphone) {
            const smsText = `کد تایید شما: ${verificationCode}`;
            try {
                console.log(`📱 Sending SMS to ${unverifiedUser.cellphone}: ${smsText}`);
                yield (0, smsService_1.sendSms)(unverifiedUser.cellphone, smsText);
                smsSent = true;
                console.log("✅ SMS sent successfully");
            }
            catch (err) {
                console.error("❌ Error sending SMS:", (err === null || err === void 0 ? void 0 : err.message) || err);
            }
        }
        const message = smsSent
            ? "Verification email and SMS sent"
            : "Verification email sent";
        return res.status(201).json({ message }); // ✅ single response + return
    }
    catch (error) {
        // Make sure to return here too
        return res.status(400).json({ message: (error === null || error === void 0 ? void 0 : error.message) || "Something went wrong" });
    }
});
exports.registerUser = registerUser;
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code } = req.body;
    try {
        const unverifiedUser = yield unverifiedUsers_1.default.findOne({
            email,
            verificationCode: code,
        });
        if (!unverifiedUser) {
            return res.status(400).json({ message: "کد ورودی اشتباه می باشد" });
        }
        const _a = unverifiedUser.toObject(), { verificationCode } = _a, userData = __rest(_a, ["verificationCode"]);
        const user = new users_1.default(userData);
        yield user.save();
        yield unverifiedUsers_1.default.deleteOne({ email: unverifiedUser.email });
        yield (0, emailService_1.sendWelcomeEmail)(user.email);
        const token = (0, helpers_1.generateToken)(user._id);
        res.status(200).json({ token, user });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.verifyUser = verifyUser;
const resendUserVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const unverifiedUser = yield unverifiedUsers_1.default.findOne({ email });
        if (!unverifiedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const verificationCode = crypto_1.default.randomBytes(3).toString("hex");
        unverifiedUser.verificationCode = verificationCode;
        yield unverifiedUser.save();
        yield (0, emailService_1.sendVerificationEmail)(unverifiedUser.email, verificationCode);
        if (unverifiedUser.cellphone) {
            const smsText = `کد تایید شما: ${verificationCode}`;
            try {
                console.log(`📱 Sending SMS to ${unverifiedUser.cellphone}: ${smsText}`);
                yield (0, smsService_1.sendSms)(unverifiedUser.cellphone, smsText);
            }
            catch (err) {
                console.error("❌ Error sending SMS:", err.message);
            }
        }
        res.status(200).json({ message: "کد تایید دوباره ارسال شد" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.resendUserVerificationCode = resendUserVerificationCode;
const removeUnverifiedUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const unverifiedUser = yield unverifiedUsers_1.default.findOne({ email });
        if (!unverifiedUser) {
            return res.status(404).json({ message: "کاربری پیدا نشد" });
        }
        yield unverifiedUsers_1.default.deleteOne({ email: unverifiedUser.email });
        res.status(200).json({ message: "کد تایید دوباره ارسال شد" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.removeUnverifiedUser = removeUnverifiedUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield users_1.default.findOne({ email });
        if (!user || !(0, helpers_1.validatePassword)(password, user.password)) {
            return res
                .status(401)
                .json({ message: "نام کاربری یا رمز عبور اشتباه است" });
        }
        const token = (0, helpers_1.generateToken)(user._id);
        res.status(200).json({
            message: "ورود با موفقیت همراه بود",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});
exports.loginUser = loginUser;
const userForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield users_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "کاربری پیدا نشد" });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        yield user.save();
        yield (0, emailService_1.sendPasswordResetEmail)(user.email, resetToken);
        res.status(200).json({ message: "لینک پسورد با موفقیت ارسال شد " });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "مشکلی پیش آمده لطفا دقایقی دیگر تلاش کنید" });
    }
});
exports.userForgotPassword = userForgotPassword;
const userResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    try {
        const user = yield users_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        user.password = yield (0, helpers_1.hashPassword)(newPassword);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        yield user.save();
        res.status(200).json({ message: "پسورد شما با موفقیت تغییر کرد" });
    }
    catch (error) {
        console.error("Error during password reset:", error);
        res
            .status(500)
            .json({ message: "مشکلی پیش آمده لطفا دقایقی دیگر تلاش کنید", error });
    }
});
exports.userResetPassword = userResetPassword;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { userId } = _a, updateData = __rest(_a, ["userId"]);
        let user;
        user = yield users_1.default.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ message: "کاربری پیدا نشد." });
        }
        res.status(200).json({ user, message: "User updated successfully." });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "An error occurred while updating the user." });
    }
});
exports.updateUser = updateUser;
const updateUserImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId, image } = req.body; // Extract providerId and image from request body
        // Find the user in the database
        const user = yield users_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Delete old image from Cloudinary if it exists
        if ((_a = user.image) === null || _a === void 0 ? void 0 : _a.public_id) {
            yield cloudinary_1.default.uploader.destroy(user.image.public_id);
        }
        // Upload new image to Cloudinary
        const result = yield cloudinary_1.default.uploader.upload(image, {
            folder: "verifiedUsers",
        });
        // Update user's image in MongoDB
        user.image = {
            public_id: result.public_id,
            url: result.secure_url,
        };
        yield user.save();
        res.status(200).json({
            message: "Profile image updated successfully",
            image: user.image,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating profile image", error });
    }
});
exports.updateUserImage = updateUserImage;
