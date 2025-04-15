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
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToMessage = exports.getReceivedMessages = exports.getSentMessages = exports.sendMessage = void 0;
const messages_1 = require("../db/messages");
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, subject, recipient, sender } = req.body;
    if (!content || !recipient || !subject || !sender) {
        return res
            .status(400)
            .json({ message: "Content, Subject and recipient are required." });
    }
    try {
        const message = new messages_1.MessageModel({
            sender,
            recipient,
            content,
            subject,
        });
        yield message.save();
        res
            .status(201)
            .json({ successMessage: "Response sent successfully", message });
    }
    catch (error) {
        res.status(500).json({ message: "Error sending message", error });
    }
});
exports.sendMessage = sendMessage;
// Function to fetch sent messages (user1)
const getSentMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield messages_1.MessageModel.find({ sender: req.user._id }).populate("recipient", "name");
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
    }
});
exports.getSentMessages = getSentMessages;
// Function to fetch received messages (user2)
const getReceivedMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield messages_1.MessageModel.find({
            recipient: req.user._id,
        }).populate("sender", "name");
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
    }
});
exports.getReceivedMessages = getReceivedMessages;
// Function to respond to a message (user2)
const respondToMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { response } = req.body;
    if (!response) {
        return res.status(400).json({ message: "Response content is required." });
    }
    try {
        const message = yield messages_1.MessageModel.findById(id);
        if (!message || message.recipient.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Unauthorized or message not found" });
        }
        message.response = response;
        message.responseTimestamp = new Date(Date.now());
        yield message.save();
        res
            .status(200)
            .json({ successMessage: "Response sent successfully", message });
    }
    catch (error) {
        res.status(500).json({ message: "Error responding to message", error });
    }
});
exports.respondToMessage = respondToMessage;
