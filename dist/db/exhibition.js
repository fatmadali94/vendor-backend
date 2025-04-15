"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExhibitionById = exports.deleteExhibitionById = exports.getExhibitionById = exports.getExhibitions = exports.ExhibitionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ExhibitionSchema = new mongoose_1.default.Schema({
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
    link: { type: String, required: false },
}, {
    timestamps: true,
});
exports.ExhibitionModel = mongoose_1.default.model("Exhibition", ExhibitionSchema);
const getExhibitions = () => exports.ExhibitionModel.find();
exports.getExhibitions = getExhibitions;
const getExhibitionById = (id) => exports.ExhibitionModel.findById(id);
exports.getExhibitionById = getExhibitionById;
const deleteExhibitionById = (id) => exports.ExhibitionModel.findOneAndDelete({ _id: id });
exports.deleteExhibitionById = deleteExhibitionById;
const updateExhibitionById = (id, values) => exports.ExhibitionModel.findByIdAndUpdate(id, values);
exports.updateExhibitionById = updateExhibitionById;
