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
exports.createUserTicket = exports.updateUserTicket = exports.getUserTicket = exports.getAllUserTickets = void 0;
const userTickets_1 = require("../db/userTickets");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const getAllUserTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allTickets = yield userTickets_1.UserTicket.find().populate("user", "name userId");
        res.status(200).json(allTickets);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching tickets", error });
    }
});
exports.getAllUserTickets = getAllUserTickets;
// Get UserTickets for a User
const getUserTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const userTickets = yield userTickets_1.UserTicket.find({ user: userId }).populate("user", "name family_name email");
        if (!userTickets || userTickets.length === 0) {
            return res.status(200).json([]); // ✅ Return empty array instead of 404
        }
        res.status(200).json(userTickets);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching tickets", error });
    }
});
exports.getUserTicket = getUserTicket;
// Admin Response to Ticket (Update)
const updateUserTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminResponse, status } = req.body;
        const updatedUserTicket = yield userTickets_1.UserTicket.findByIdAndUpdate(req.params.userTicketId, { adminResponse, status }, { new: true });
        res.status(200).json(updatedUserTicket);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating ticket", error });
    }
});
exports.updateUserTicket = updateUserTicket;
const createUserTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, subject, description, image, originalFileName } = req.body;
        let uploadedImage = null;
        if (image) {
            const result = yield cloudinary_1.default.uploader.upload(image, {
                folder: "userTickets",
                resource_type: "auto",
            });
            uploadedImage = {
                public_id: result.public_id,
                url: result.secure_url,
                originalFileName: originalFileName || "Unknown File", // ✅ Ensure file name is saved
            };
        }
        const newUserTicket = new userTickets_1.UserTicket({
            user: userId,
            subject,
            description,
            image: uploadedImage, // ✅ Store the full image object, including originalFileName
        });
        yield newUserTicket.save();
        return res.status(201).json(newUserTicket); // ✅ Ensure full ticket object is sent back
    }
    catch (error) {
        console.error("❌ Error creating ticket:", error);
        res.status(500).json({ message: "Error creating ticket", error });
    }
});
exports.createUserTicket = createUserTicket;
