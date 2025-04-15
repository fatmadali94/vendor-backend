"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMaterialNameById = exports.deleteMaterialNameById = exports.getMaterialNameById = exports.getMaterialNames = exports.materialNameModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MaterialNameSchema = new mongoose_1.default.Schema({
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
    materialGrades: [
        { type: mongoose_1.default.Schema.Types.ObjectId, ref: "MaterialGrades" },
    ],
}, {
    timestamps: true,
});
exports.materialNameModel = mongoose_1.default.model("MaterialNames", MaterialNameSchema);
const getMaterialNames = () => exports.materialNameModel
    .find()
    .populate({
    path: "materialGrades",
    model: "MaterialGrades", // Ensures that Mongoose knows which model to use for population
})
    .exec();
exports.getMaterialNames = getMaterialNames;
const getMaterialNameById = (id) => exports.materialNameModel.findById(id);
exports.getMaterialNameById = getMaterialNameById;
// export const createMaterialName = (values: any) =>
//   new materialNameModel(values).save().then((sub) => sub.toObject());
const deleteMaterialNameById = (id) => exports.materialNameModel.findOneAndDelete({ _id: id });
exports.deleteMaterialNameById = deleteMaterialNameById;
const updateMaterialNameById = (id, values) => exports.materialNameModel.findByIdAndUpdate(id, values);
exports.updateMaterialNameById = updateMaterialNameById;
