"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePartNameById = exports.deletePartNameById = exports.getPartNames = exports.partNameModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PartNameSchema = new mongoose_1.default.Schema({
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
    slug: { type: String, required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
    partGeneralIds: [
        { type: mongoose_1.default.Schema.Types.ObjectId, ref: "PartGeneralIds" },
    ],
}, {
    timestamps: true,
});
exports.partNameModel = mongoose_1.default.model("PartNames", PartNameSchema);
const getPartNames = () => exports.partNameModel
    .find()
    .populate({
    path: "partGeneralIds",
    model: "PartGeneralIds", // Ensures that Mongoose knows which model to use for population
})
    .exec();
exports.getPartNames = getPartNames;
const deletePartNameById = (id) => exports.partNameModel.findOneAndDelete({ _id: id });
exports.deletePartNameById = deletePartNameById;
//
const updatePartNameById = (id, values) => exports.partNameModel.findByIdAndUpdate(id, values, {
    new: true,
});
exports.updatePartNameById = updatePartNameById;
