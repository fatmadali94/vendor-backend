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
exports.leaveRating = void 0;
const constants_1 = require("../utils/constants");
const users_1 = __importDefault(require("../db/users"));
const rating_1 = __importDefault(require("../db/rating"));
const providers_1 = __importDefault(require("../db/providers"));
const materialProviders_1 = require("../db/materials/materialProviders");
const partProviders_1 = require("../db/parts/partProviders");
const leaveRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId, userId, rating } = req.body;
        // Find the user and provider
        const user = yield users_1.default.findById(userId);
        if (!user || !user.isVerified) {
            return res
                .status(400)
                .json({ message: "User not found or not verified" });
        }
        // const regularProvider = await Provider.findById(providerId);
        // const materialProvider = await MaterialProviderModel.findById(providerId)
        //   const partProvider = await PartProviderModel.findById(providerId)
        const [regularProvider, materialProvider, partProvider] = yield Promise.all([
            providers_1.default.findById(providerId),
            materialProviders_1.MaterialProviderModel.findById(providerId),
            partProviders_1.PartProviderModel.findById(providerId),
        ]);
        const provider = regularProvider || materialProvider || partProvider;
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        // Verify the user's company and position
        const company = constants_1.companies.find((c) => c.id === user.companyId);
        if (!company || !company.positions.includes(user.occupation)) {
            return res
                .status(400)
                .json({ message: "Invalid company or position for this rating" });
        }
        // Check for an existing rating
        let existingRating = yield rating_1.default.findOne({
            provider: providerId,
            companyId: user.companyId,
            position: user.occupation,
        });
        if (existingRating) {
            // Archive the current rating and update with a new rating
            existingRating.previousRatings.push({
                rating: existingRating.rating,
                timestamp: existingRating.timestamp,
            });
            existingRating.rating = rating;
            existingRating.timestamp = new Date();
            yield existingRating.save();
        }
        else {
            // Create a new rating entry
            const newRating = new rating_1.default({
                provider: providerId,
                companyId: user.companyId,
                position: user.occupation,
                user: userId,
                rating: rating,
                timestamp: new Date(),
            });
            const savedRating = yield newRating.save();
            provider.ratings.push(savedRating._id);
            yield provider.save();
        }
        const updatedRatings = yield rating_1.default.find({ provider: providerId });
        return res.status(200).json(updatedRatings);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.leaveRating = leaveRating;
