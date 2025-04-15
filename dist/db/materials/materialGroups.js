"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMaterialGroupById = exports.deleteMaterialGroupById = exports.getMaterialGroupById = exports.getMaterialGroups = exports.materialGroupModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MaterialGroupSchema = new mongoose_1.default.Schema({
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
    materialNames: [
        { type: mongoose_1.default.Schema.Types.ObjectId, ref: "MaterialNames" },
    ],
}, {
    timestamps: true,
});
exports.materialGroupModel = mongoose_1.default.model("MaterialGroups", MaterialGroupSchema);
const getMaterialGroups = () => exports.materialGroupModel
    .find()
    .populate({
    path: "materialNames",
    model: "MaterialNames", // Ensures that Mongoose knows which model to use for population
})
    .exec();
exports.getMaterialGroups = getMaterialGroups;
const getMaterialGroupById = (id) => exports.materialGroupModel
    .findById(id)
    .populate({
    path: "materialNames",
    model: "MaterialNames", // Ensures that Mongoose knows which model to use for population
})
    .exec();
exports.getMaterialGroupById = getMaterialGroupById;
// export const createMaterialGroup = (values: Record<string, any>) =>
//   new materialGroupModel(values).save().then((user) => user.toObject());
const deleteMaterialGroupById = (id) => exports.materialGroupModel.findOneAndDelete({ _id: id });
exports.deleteMaterialGroupById = deleteMaterialGroupById;
const updateMaterialGroupById = (id, values) => exports.materialGroupModel.findByIdAndUpdate(id, values, {
    new: true,
});
exports.updateMaterialGroupById = updateMaterialGroupById;
