"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMaterialGradeById = exports.deleteMaterialGradeById = exports.getMaterialGradeById = exports.getMaterialGrades = exports.materialGradeModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MaterialGradeSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
exports.materialGradeModel = mongoose_1.default.model("MaterialGrades", MaterialGradeSchema);
const getMaterialGrades = () => exports.materialGradeModel.find();
exports.getMaterialGrades = getMaterialGrades;
const getMaterialGradeById = (id) => exports.materialGradeModel.findById(id);
exports.getMaterialGradeById = getMaterialGradeById;
// export const createMaterialGrade = (values: any) =>
//   new materialGradeModel(values).save().then((sub) => sub.toObject());
const deleteMaterialGradeById = (id) => exports.materialGradeModel.findOneAndDelete({ _id: id });
exports.deleteMaterialGradeById = deleteMaterialGradeById;
const updateMaterialGradeById = (id, values) => exports.materialGradeModel.findByIdAndUpdate(id, values);
exports.updateMaterialGradeById = updateMaterialGradeById;
