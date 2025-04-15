"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMagazineById = exports.createNewMagazine = exports.deleteMagazineById = exports.getMagazineById = exports.getDigitalMagazine = exports.magazineModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MagazineSchema = new mongoose_1.default.Schema({
    image: { public_id: { type: String }, url: { type: String } },
    pdf: { public_id: { type: String }, url: { type: String } },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    year: { type: Number },
    month: { type: String },
    number: { type: Number },
    topics: [
        {
            topic: { type: String, required: true },
            page: { type: Number, required: true }, // ✅ Related page number
        }
    ],
    pages: [{ type: Number }],
    advertisements: [{ public_id: { type: String }, url: { type: String } }],
    editorial: {
        name: { type: String },
        text: { type: String },
        image: { public_id: { type: String }, url: { type: String } },
    },
    collectors: [
        {
            name: { type: String },
            images: [{ public_id: { type: String }, url: { type: String } }],
        },
    ],
}, { timestamps: true });
exports.magazineModel = mongoose_1.default.model("DigitalMagazine", MagazineSchema);
// ✅ Export CRUD functions properly
const getDigitalMagazine = () => exports.magazineModel.find();
exports.getDigitalMagazine = getDigitalMagazine;
const getMagazineById = (id) => exports.magazineModel.findById(id);
exports.getMagazineById = getMagazineById;
const deleteMagazineById = (id) => exports.magazineModel.findOneAndDelete({ _id: id });
exports.deleteMagazineById = deleteMagazineById;
const createNewMagazine = (data) => new exports.magazineModel(data).save(); // ⬅ Renamed to `createNewMagazine`
exports.createNewMagazine = createNewMagazine;
const updateMagazineById = (id, data) => exports.magazineModel.findByIdAndUpdate(id, data, { new: true });
exports.updateMagazineById = updateMagazineById;
