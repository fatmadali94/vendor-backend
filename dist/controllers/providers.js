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
exports.deleteUploadedFile = exports.getVerifiedProvider = exports.updateProvider = exports.getMe = exports.providerResetPassword = exports.providerForgotPassword = exports.resendProviderVerificationCode = exports.loginProvider = exports.removeUnverifiedProvider = exports.verifyProvider = exports.registerProvider = exports.getAllProviders = exports.uploadProviderFile = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("../db/users"));
const providers_1 = __importDefault(require("../db/providers"));
const crypto_1 = __importDefault(require("crypto"));
const emailService_1 = require("./emailService");
const unverifiedProviders_1 = __importDefault(require("../db/unverifiedProviders"));
const helpers_1 = require("../utils/helpers");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const smsService_1 = require("./smsService");
dotenv_1.default.config();
const uploadProviderFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { file, providerId, originalFilename } = req.body;
        if (!file) {
            return res.status(400).json({ message: "File is required" });
        }
        if (!providerId) {
            return res.status(400).json({ message: "Provider ID is required" });
        }
        const fileSizeInBytes = Buffer.byteLength(file, "utf-8");
        const maxSizeInBytes = 10 * 1024 * 1024; // ✅ 10MB Limit
        if (fileSizeInBytes > maxSizeInBytes) {
            return res.status(400).json({ message: "File size exceeds 10MB limit" });
        }
        const fileType = file.split(";")[0].split("/")[1].toLowerCase();
        let uploadOptions = {
            folder: `provider_uploads/${providerId}`,
        };
        if (fileType === "pdf") {
            uploadOptions.resource_type = "raw";
        }
        // ✅ Upload to Cloudinary
        const result = yield cloudinary_1.default.uploader.upload(file, uploadOptions);
        // ✅ Find provider in DB
        const provider = yield providers_1.default.findById(providerId);
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        // ✅ Create file object
        const newFile = {
            public_id: result.public_id,
            url: result.secure_url,
            filename: result.original_filename,
            fileType,
            originalFilename,
        };
        // ✅ Add to uploadedFiles array
        provider.uploadedFiles = provider.uploadedFiles || [];
        provider.uploadedFiles.push(newFile);
        yield provider.save();
        res.status(200).json({
            message: "File uploaded successfully",
            file: newFile,
        });
    }
    catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});
exports.uploadProviderFile = uploadProviderFile;
const getAllProviders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const providers = yield providers_1.default.find();
        return res.status(200).json(providers);
    }
    catch (error) {
        return res.sendStatus(400);
    }
});
exports.getAllProviders = getAllProviders;
const registerProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = req.body;
    try {
        // Build records and remove empties
        const processedRecords = (data.records || [])
            .map((record) => {
            if (record.materialgroup || record.materialname || record.materialgrade) {
                return {
                    materialgroup: record.materialgroup,
                    materialname: record.materialname,
                    materialgrade: record.materialgrade,
                };
            }
            if (record.partgroup || record.partname || record.partgeneralid) {
                return {
                    partgroup: record.partgroup,
                    partname: record.partname,
                    partgeneralid: record.partgeneralid,
                };
            }
            return null;
        })
            .filter(Boolean);
        const verificationCode = crypto_1.default.randomBytes(3).toString("hex");
        const hashedPassword = yield (0, helpers_1.hashPassword)(data.password);
        let imagePayload = undefined;
        if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.image) {
            const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
                folder: "verifiedProviders",
            });
            imagePayload = { public_id: result.public_id, url: result.secure_url };
        }
        const unverifiedProvider = new unverifiedProviders_1.default(Object.assign(Object.assign(Object.assign({}, data), { records: processedRecords, password: hashedPassword, verificationCode }), (imagePayload ? { image: imagePayload } : {})));
        yield unverifiedProvider.save();
        // Email is required for verification; fail early if it errors
        yield (0, emailService_1.sendVerificationEmail)(unverifiedProvider.email, verificationCode);
        // Try SMS but don't fail the whole request if it errors
        let smsSent = false;
        if (unverifiedProvider.cellphone) {
            const smsText = `کد تایید شما: ${verificationCode}`;
            try {
                console.log(`📱 Sending SMS to ${unverifiedProvider.cellphone}: ${smsText}`);
                yield (0, smsService_1.sendSms)(unverifiedProvider.cellphone, smsText);
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
exports.registerProvider = registerProvider;
const verifyProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code } = req.body;
    try {
        const unverifiedProvider = yield unverifiedProviders_1.default.findOne({
            email,
            verificationCode: code,
        });
        if (!unverifiedProvider) {
            return res.status(400).json({ message: "کد ورودی اشتباه می باشد" });
        }
        const _b = unverifiedProvider.toObject(), { verificationCode } = _b, providerData = __rest(_b, ["verificationCode"]);
        const provider = new providers_1.default(providerData);
        yield provider.save();
        // Remove the unverified provider from the UnverifiedUser collection
        yield unverifiedProviders_1.default.deleteOne({ email: unverifiedProvider.email });
        yield (0, emailService_1.sendWelcomeEmail)(provider.email);
        const token = (0, helpers_1.generateToken)(provider._id);
        res.status(200).json({ token, provider });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.verifyProvider = verifyProvider;
const removeUnverifiedProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const unverifiedProvider = yield unverifiedProviders_1.default.findOne({ email });
        if (!unverifiedProvider) {
            return res.status(404).json({ message: "User not found" });
        }
        yield unverifiedProviders_1.default.deleteOne({ email: unverifiedProvider.email });
        res.status(200).json({ message: "Verification code resent" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.removeUnverifiedProvider = removeUnverifiedProvider;
const loginProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const provider = yield providers_1.default.findOne({ email });
        if (!provider || !(0, helpers_1.validatePassword)(password, provider.password)) {
            return res
                .status(401)
                .json({ message: "نام کاربری یا رمز عبور اشتباه است" });
        }
        const token = (0, helpers_1.generateToken)(provider._id);
        res.status(200).json({
            message: "Login successful",
            token,
            provider: {
                id: provider._id,
                email: provider.email,
                name: provider.company_name,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});
exports.loginProvider = loginProvider;
const resendProviderVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const unverifiedProvider = yield unverifiedProviders_1.default.findOne({ email });
        if (!unverifiedProvider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        const verificationCode = crypto_1.default.randomBytes(3).toString("hex");
        unverifiedProvider.verificationCode = verificationCode;
        yield unverifiedProvider.save();
        yield (0, emailService_1.sendVerificationEmail)(unverifiedProvider.email, verificationCode);
        res.status(200).json({ message: "Verification code resent" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.resendProviderVerificationCode = resendProviderVerificationCode;
const providerForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const provider = yield providers_1.default.findOne({ email });
        if (!provider) {
            return res.status(404).json({ message: "User not found" });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        provider.resetPasswordToken = resetToken;
        provider.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        yield provider.save();
        yield (0, emailService_1.sendPasswordResetEmail)(provider.email, resetToken);
        res.status(200).json({ message: "Password reset email sent" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});
exports.providerForgotPassword = providerForgotPassword;
const providerResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    try {
        const provider = yield providers_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!provider) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        provider.password = (0, helpers_1.hashPassword)(newPassword);
        provider.resetPasswordToken = undefined;
        provider.resetPasswordExpires = undefined;
        yield provider.save();
        res.status(200).json({ message: "Password has been reset" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});
exports.providerResetPassword = providerResetPassword;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield users_1.default.findById(req.user._id).select("-password");
        if (!user) {
            user = yield providers_1.default.findById(req.user._id).select("-password");
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMe = getMe;
const updateProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const { userId, formData, records, image } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "Missing provider ID" });
        }
        const provider = yield providers_1.default.findById(userId);
        if (!provider) {
            return res.status(404).json({ message: "User not found." });
        }
        if (formData) {
            Object.assign(provider, formData);
        }
        if (records && Array.isArray(records)) {
            provider.records = records;
        }
        if (image && typeof image === "object" && image.base64) {
            if ((_c = provider.image) === null || _c === void 0 ? void 0 : _c.public_id) {
                yield cloudinary_1.default.uploader.destroy(provider.image.public_id);
            }
            const result = yield cloudinary_1.default.uploader.upload(image.base64, {
                folder: "verifiedProviders",
            });
            console.log(result);
            provider.image = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }
        console.log(provider);
        yield provider.save();
        return res.status(200).json({
            provider,
            message: "User updated successfully.",
        });
    }
    catch (error) {
        console.error("Error updating provider:", error);
        if (error instanceof Error) {
            return res.status(500).json({
                message: "An error occurred while updating the provider.",
                error: error.message,
            });
        }
        else {
            return res.status(500).json({
                message: "An unknown error occurred while updating the provider.",
            });
        }
    }
});
exports.updateProvider = updateProvider;
// export const getAllVerifiedProviders = async (req: any, res: any) => {
//   try {
//     const providers = await Provider.find();
//     res.status(200).json(providers);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to retrieve providers", error });
//   }
// };
const getVerifiedProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const provider = yield providers_1.default.findById(id); // No need for .populate()
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        // Remove invalid files (those missing `url` or with zero size)
        provider.uploadedFiles = provider.uploadedFiles.filter((file) => file.url && file.originalFilename);
        return res.status(200).json(provider);
    }
    catch (error) {
        console.error("Error fetching provider:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getVerifiedProvider = getVerifiedProvider;
const deleteUploadedFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId, fileId, publicId } = req.body;
        if (!providerId || !fileId || !publicId) {
            return res.status(400).json({ message: "Missing required parameters" });
        }
        yield cloudinary_1.default.uploader.destroy(publicId);
        const provider = yield providers_1.default.findByIdAndUpdate(providerId, { $pull: { uploadedFiles: { _id: fileId } } }, { new: true } // Returns the updated provider
        );
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        res.status(200).json({
            message: "File deleted successfully",
            uploadedFiles: provider.uploadedFiles, // Return updated files list
        });
    }
    catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.deleteUploadedFile = deleteUploadedFile;
// export const updateProviderImage = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const { providerId, image } = req.body; // Extract providerId and image from request body
//     // Find the provider in the database
//     const provider = await Provider.findById(providerId);
//     if (!provider) {
//       return res.status(404).json({ message: "Provider not found" });
//     }
//     // Delete old image from Cloudinary if it exists
//     if (provider.image?.public_id) {
//       await cloudinary.uploader.destroy(provider.image.public_id);
//     }
//     // Upload new image to Cloudinary
//     const result = await cloudinary.uploader.upload(image, {
//       folder: "verifiedProviders",
//     });
//     // Update provider's image in MongoDB
//     provider.image = {
//       public_id: result.public_id,
//       url: result.secure_url,
//     };
//     await provider.save();
//     res.status(200).json({
//       message: "Profile image updated successfully",
//       image: provider.image,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating profile image", error });
//   }
// };
// export const updateProviderRecords = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const { providerId, records } = req.body; // Extract providerId and records from request body
//     // Find the provider in the database
//     const provider = await Provider.findById(providerId);
//     if (!provider) {
//       return res.status(404).json({ message: "Provider not found" });
//     }
//     // Update provider's records in MongoDB with the new records coming from the frontend
//     provider.records = records;
//     await provider.save();
//     res.status(200).json({
//       message: "Provider records updated successfully",
//       records: provider.records,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating provider records", error });
//   }
// };
