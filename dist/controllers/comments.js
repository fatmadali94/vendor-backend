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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveComment = void 0;
// controllers/commentController.js
const comments_1 = __importDefault(require("../db/comments"));
const providers_1 = __importDefault(require("../db/providers"));
const users_1 = __importDefault(require("../db/users"));
const materialProviders_1 = require("../db/materials/materialProviders");
const partProviders_1 = require("../db/parts/partProviders");
const leaveComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId, userId, content } = req.body;
        // Find the user and verify
        const user = yield users_1.default.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        // Find the provider
        const [regularProvider, materialProvider, partProvider] = yield Promise.all([
            providers_1.default.findById(providerId),
            materialProviders_1.MaterialProviderModel.findById(providerId),
            partProviders_1.PartProviderModel.findById(providerId),
        ]);
        const provider = regularProvider || materialProvider || partProvider;
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        // Create the new comment
        const newComment = new comments_1.default({
            user: userId,
            companyId: user.companyId,
            position: user.occupation,
            provider: providerId,
            content,
            timestamp: new Date(),
        });
        const savedComment = yield newComment.save();
        // Add the comment ID to the provider's comments array
        provider.comments.push(savedComment._id);
        yield provider.save();
        return res.status(200).json(savedComment);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.leaveComment = leaveComment;
