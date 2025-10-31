"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const unverifiedUserSchema = new mongoose_1.Schema({
    image: {
        public_id: {
            type: String,
            required: false,
        },
        url: {
            type: String,
            required: false,
        },
    },
    name: {
        type: String,
        required: true,
    },
    family_name: {
        type: String,
        required: true,
    },
    username: { type: String, required: true, unique: true },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    cellphone: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    id_number: {
        type: String,
        required: true,
        unique: true,
    },
    occupation: {
        type: String,
        enum: [
            "procurement",
            "technical_officer",
            "startup_member",
            "quality_control",
            "research_development",
            "quality_assurance",
            "quality_assurance",
            "student",
            "other",
        ],
        default: "other",
    },
    role: {
        type: String,
        enum: ["admin", "provider", "user"],
        default: "user",
    },
    sex: {
        type: String,
        enum: ["man", "woman", "other"],
        default: "other",
    },
    user_company: {
        type: String,
        enum: [
            "none",
            "kavir_tire",
            "barez_tire",
            "barezkordestan_tire",
            "khoozestan_tire",
            "kian_tire",
            "iran_tire",
            "razi_tire",
            "dena_tire",
            "artavil_tire",
            "pars_tire",
            "iranyasa_tire",
            "yazd_tire",
        ],
        default: "none"
    },
    verificationCode: {
        type: String,
        required: true,
    },
}, { timestamps: true });
unverifiedUserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            return next();
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        this.password = yield bcrypt_1.default.hash(this.password, salt);
        next();
    });
});
unverifiedUserSchema.methods.matchPassword = function (enteredPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(enteredPassword, this.password);
    });
};
const UnverifiedUser = mongoose_1.default.model("UnverifiedUser", unverifiedUserSchema);
exports.default = UnverifiedUser;
