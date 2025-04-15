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
exports.createProviderTicket = exports.updateProviderTicket = exports.getProviderTicket = exports.getAllProviderTickets = void 0;
const providerTickets_1 = require("../db/providerTickets");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const getAllProviderTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allTickets = yield providerTickets_1.ProviderTicket.find().populate("provider", "form_filler_name providerId");
        res.status(200).json(allTickets);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching tickets", error });
    }
});
exports.getAllProviderTickets = getAllProviderTickets;
// Get ProviderTickets for a Provider
const getProviderTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId } = req.params;
        const providerTickets = yield providerTickets_1.ProviderTicket.find({ provider: providerId }).populate("provider", "form_filler_name providerId company_name");
        if (!providerTickets || providerTickets.length === 0) {
            return res.status(200).json([]); // ✅ Return empty array instead of an error
        }
        res.status(200).json(providerTickets);
    }
    catch (error) {
        console.error("❌ Error fetching provider tickets:", error);
        res.status(500).json({ message: "Error fetching tickets", error });
    }
});
exports.getProviderTicket = getProviderTicket;
// Admin Response to Ticket (Update)
const updateProviderTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminResponse, status } = req.body;
        const updatedProviderTicket = yield providerTickets_1.ProviderTicket.findByIdAndUpdate(req.params.providerTicketId, { adminResponse, status }, { new: true });
        res.status(200).json(updatedProviderTicket);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating ticket", error });
    }
});
exports.updateProviderTicket = updateProviderTicket;
const createProviderTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId, subject, description, image, originalFileName } = req.body;
        let uploadedImage = null;
        if (image) {
            const result = yield cloudinary_1.default.uploader.upload(image, {
                folder: "providerTickets",
                resource_type: "auto",
            });
            uploadedImage = {
                public_id: result.public_id,
                url: result.secure_url,
                originalFileName: originalFileName || "Unknown File", // ✅ Ensure file name is saved
            };
        }
        const newProviderTicket = new providerTickets_1.ProviderTicket({
            provider: providerId,
            subject,
            description,
            image: uploadedImage, // ✅ Store the full image object, including originalFileName
        });
        yield newProviderTicket.save();
        return res.status(201).json(newProviderTicket); // ✅ Ensure full ticket object is sent back
    }
    catch (error) {
        console.error("❌ Error creating ticket:", error);
        res.status(500).json({ message: "Error creating ticket", error });
    }
});
exports.createProviderTicket = createProviderTicket;
