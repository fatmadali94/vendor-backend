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
exports.getMe = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("../db/users"));
const providers_1 = __importDefault(require("../db/providers"));
dotenv_1.default.config();
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
