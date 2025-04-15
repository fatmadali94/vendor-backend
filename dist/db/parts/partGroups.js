"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePartGroupById = exports.deletePartGroupById = exports.getPartGroups = exports.partGroupModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PartGroupSchema = new mongoose_1.default.Schema({
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
    title: { type: String, required: true },
    description: { type: String, required: true },
    partNames: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "PartNames" }],
}, {
    timestamps: true,
});
exports.partGroupModel = mongoose_1.default.model("PartGroups", PartGroupSchema);
const getPartGroups = () => exports.partGroupModel
    .find()
    .populate({
    path: "partNames",
    model: "PartNames", // Ensures that Mongoose knows which model to use for population
})
    .exec();
exports.getPartGroups = getPartGroups;
const deletePartGroupById = (id) => exports.partGroupModel.findOneAndDelete({ _id: id });
exports.deletePartGroupById = deletePartGroupById;
const updatePartGroupById = (id, values) => exports.partGroupModel.findByIdAndUpdate(id, values, {
    new: true,
});
exports.updatePartGroupById = updatePartGroupById;
