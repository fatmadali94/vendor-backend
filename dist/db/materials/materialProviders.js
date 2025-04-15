"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMaterialProviderById = exports.getMaterialProviderById = exports.getMaterialProviders = exports.MaterialProviderModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MaterialProviderSchema = new mongoose_1.default.Schema({
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
    name: { type: String, required: false },
    export_destination: { type: String, required: false },
    has_export: { type: Boolean, required: false },
    score: { type: Number, required: false },
    knowledge_based: { type: Boolean, required: false },
    establish_year: { type: Number, required: false },
    production_type: {
        type: String,
        enum: [
            "industrial-production",
            "semi-industrial-production",
            "trial-production",
        ],
        required: false,
    },
    production_volume: { type: Number, required: false },
    cooperation_length: { type: Number, required: false },
    link: { type: String, required: false },
    phone: { type: String, required: false },
    description: { type: String, required: false },
    address: { type: String, required: false },
    email: { type: String, required: false },
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
    ],
    ratings: [
        { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Rating", required: false },
    ],
    comments: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Comment" }],
}, {
    timestamps: true,
});
exports.MaterialProviderModel = mongoose_1.default.model("MaterialProviders", MaterialProviderSchema);
const getMaterialProviders = () => {
    const materialProviders = exports.MaterialProviderModel.find()
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
        .exec();
    return materialProviders;
};
exports.getMaterialProviders = getMaterialProviders;
const getMaterialProviderById = (id) => exports.MaterialProviderModel.findById(id)
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
exports.getMaterialProviderById = getMaterialProviderById;
const deleteMaterialProviderById = (id) => exports.MaterialProviderModel.findOneAndDelete({ _id: id });
exports.deleteMaterialProviderById = deleteMaterialProviderById;
