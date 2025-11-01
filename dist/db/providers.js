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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getVerifiedProviderById = exports.getVerifiedPartProviders = exports.getVerifiedMaterialProviders = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const messages_1 = __importDefault(require("./messages"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const providerSchema = new mongoose_1.Schema({
    uploadedFiles: [
        {
            public_id: {
                type: String,
                required: false,
            },
            url: {
                type: String,
                required: false,
            },
            fileType: {
                type: String,
                required: false, // The file type (e.g., 'pdf', 'jpeg', etc.)
            },
            originalFilename: {
                type: String,
                required: false,
            },
        },
    ],
    description: {
        type: String,
        required: false
    },
    fax_number: {
        type: String,
        required: false,
    },
    ceo_name: {
        type: String,
        required: false
    },
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
    // updateImage: {
    //   public_id: {
    //     type: String,
    //     required: false,
    //   },
    //   url: {
    //     type: String,
    //     required: false,
    //   },
    // },
    company_name: {
        type: String,
        required: false,
    },
    company_type: {
        required: false,
        type: String,
    },
    export: {
        required: false,
        type: String,
    },
    knowledgebased: {
        required: false,
        type: String,
    },
    username: {
        required: true,
        type: String,
    },
    website_address: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: false,
    },
    cellphone: {
        type: String,
        required: false,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    id_number: {
        type: String,
        required: false,
        unique: true,
    },
    foundation_year: {
        type: String,
        required: false,
    },
    postal_code: {
        type: String,
        required: false,
    },
    economical_number: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: false,
    },
    country: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: false,
    },
    form_filler_name: {
        type: String,
        required: false,
    },
    form_filler_position: {
        type: String,
        required: false,
    },
    records: [
        {
            materialgroup: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "MaterialGroups",
                required: false,
            },
            materialname: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "MaterialNames",
                required: false,
            },
            materialgrade: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "MaterialGrades",
                required: false,
            },
        },
        {
            partgroup: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "PartGroups",
                required: false,
            },
            partname: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "PartNames",
                required: false,
            },
            partgeneralid: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "PartGeneralIds",
                required: false,
            },
        },
    ],
    // updatedRecords: [
    //   {
    //     materialgroup: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "MaterialGroups",
    //       required: false,
    //     },
    //     materialname: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "MaterialNames",
    //       required: false,
    //     },
    //     materialgrade: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "MaterialGrades",
    //       required: false,
    //     },
    //   },
    //   {
    //     partgroup: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "PartGroups",
    //       required: false,
    //     },
    //     partname: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "PartNames",
    //       required: false,
    //     },
    //     partgeneralid: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "PartGeneralIds",
    //       required: false,
    //     },
    //   },
    // ],
    messages: [messages_1.default], // Correct usage of messageSchema here
    ratings: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Rating" }],
    comments: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Comment" }],
    providerTickets: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "providerTickets" }],
    isVerified: { type: Boolean, default: false }, // Boolean f
    role: {
        type: String,
        enum: ["admin", "provider", "user"],
        default: "provider",
    },
});
providerSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            return next();
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        this.password = yield bcrypt_1.default.hash(this.password, salt);
        next();
    });
});
providerSchema.methods.matchPassword = function (enteredPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(enteredPassword, this.password);
    });
};
const Provider = mongoose_1.default.model("Provider", providerSchema);
const getVerifiedMaterialProviders = () => {
    const verifiedMaterialProviders = Provider.find()
        .populate({
        path: "records.materialgroup",
        model: "MaterialGroups", // Ensures that Mongoose knows which model to use for population
    })
        .populate({
        path: "records.materialname",
        model: "MaterialNames", // Similarly, define the model for material names
    })
        .populate({
        path: "records.materialgrade",
        model: "MaterialGrades", // And for material grades
    })
        // .populate({
        //   path: "records.partgroup",
        //   model: "PartGroups", 
        // })
        // .populate({
        //   path: "records.partname",
        //   model: "PartNames", 
        // })
        // .populate({
        //   path: "records.partgeneralId",
        //   model: "PartGeneralId", 
        // })
        .populate({
        path: "ratings",
        model: "Rating",
        // select: "position companyId rating", // Only select specific fields from Rating
    })
        .populate({
        path: "comments",
        model: "Comment",
        // select: "position companyId rating", // Only select specific fields from Rating
    })
        .exec();
    return verifiedMaterialProviders;
};
exports.getVerifiedMaterialProviders = getVerifiedMaterialProviders;
const getVerifiedPartProviders = () => {
    const verifiedPartProviders = Provider.find()
        .populate({
        path: "records.materialgroup",
        model: "MaterialGroups", // Ensures that Mongoose knows which model to use for population
    })
        .populate({
        path: "records.materialname",
        model: "MaterialNames", // Similarly, define the model for material names
    })
        .populate({
        path: "records.materialgrade",
        model: "MaterialGrades", // And for material grades
    })
        // .populate({
        //   path: "records.partgroup",
        //   model: "PartGroups", 
        // })
        // .populate({
        //   path: "records.partname",
        //   model: "PartNames", 
        // })
        // .populate({
        //   path: "records.partgeneralId",
        //   model: "PartGeneralId", 
        // })
        .populate({
        path: "ratings",
        model: "Rating",
        // select: "position companyId rating", // Only select specific fields from Rating
    })
        .populate({
        path: "comments",
        model: "Comment",
        // select: "position companyId rating", // Only select specific fields from Rating
    })
        .exec();
    return verifiedPartProviders;
};
exports.getVerifiedPartProviders = getVerifiedPartProviders;
const getVerifiedProviderById = (id) => Provider.findById(id)
    .populate({
    path: "records.materialgroup",
    model: "MaterialGroups", // Ensures that Mongoose knows which model to use for population
})
    .populate({
    path: "records.materialname",
    model: "MaterialNames", // Similarly, define the model for material names
})
    .populate({
    path: "records.materialgrade",
    model: "MaterialGrades", // And for material grades
})
    .populate({
    path: "records.partgroup",
    model: "PartGroups",
})
    .populate({
    path: "records.partname",
    model: "PartNames",
})
    .populate({
    path: "records.partgeneralId",
    model: "PartGeneralId",
})
    .populate({
    path: "ratings",
    model: "Rating",
    // select: "position companyId rating", // Only select specific fields from Rating
})
    .populate({
    path: "comments",
    model: "Comment",
    // select: "position companyId rating", // Only select specific fields from Rating
})
    .exec();
exports.getVerifiedProviderById = getVerifiedProviderById;
exports.default = Provider;
