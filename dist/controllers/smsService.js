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
exports.sendSms = void 0;
const axios_1 = __importDefault(require("axios"));
// Load environment variables from the .env file
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendSms = (to, message) => __awaiter(void 0, void 0, void 0, function* () {
    const { SMS_USERNAME, SMS_PASSWORD, SMS_FROM } = process.env;
    if (!SMS_USERNAME || !SMS_PASSWORD || !SMS_FROM) {
        throw new Error("Missing SMS credentials in environment variables");
    }
    try {
        // Prepare the data for the POST request
        const data = {
            UserName: process.env.SMS_USERNAME,
            Password: process.env.SMS_PASSWORD,
            From: process.env.SMS_FROM,
            To: to, // The recipient's phone number
            Message: message, // The message you want to send
        };
        // Make the POST request to the SMS API
        const response = yield axios_1.default.post("http://login.niazpardaz.com/SMSInOutBox/Send", data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("📨 SMS API Response:", response.data);
        // Handle the response
        if (response.data) {
            return response.data;
        }
        else {
            throw new Error("Message failed to send");
        }
    }
    catch (error) {
        console.error("Error sending SMS:", error);
        throw error;
    }
});
exports.sendSms = sendSms;
