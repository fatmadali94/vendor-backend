"use strict";
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
exports.updateMaterialName = exports.createMaterialName = exports.deleteMaterialName = exports.getAllMaterialNames = void 0;
var mongoose = require("mongoose");
const materialNames_1 = require("../../db/materials/materialNames");
const materialNames_2 = require("../../db/materials/materialNames");
const cloudinary_1 = __importDefault(require("../../utils/cloudinary"));
const getAllMaterialNames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const materialNames = yield (0, materialNames_1.getMaterialNames)();
        return res.status(200).json(materialNames);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllMaterialNames = getAllMaterialNames;
const deleteMaterialName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedMaterialName = yield (0, materialNames_1.deleteMaterialNameById)(id);
        if (deletedMaterialName.image) {
            const imgId = deletedMaterialName.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
        }
        return res.status(200).json("materialName got deleted").end();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.deleteMaterialName = deleteMaterialName;
const createMaterialName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "materialnames",
        });
        // const url = req.protocol + "://" + req.get("host");
        const newMaterialName = new materialNames_2.materialNameModel(Object.assign(Object.assign({}, req.body), { image: {
                public_id: result.public_id,
                url: result.secure_url,
            } }));
        yield newMaterialName.save();
        return res.status(200).json(newMaterialName).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createMaterialName = createMaterialName;
// export const getMaterialName = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const { id } = req.params;
//     const product = await getMaterialNameById(id);
//     return res.status(200).json(product);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(400);
//   }
// };
const updateMaterialName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const previousMaterialName = yield materialNames_2.materialNameModel.find({
            _id: id,
        });
        const updatedMaterialName = {
            title: req.body.title ? req.body.title : previousMaterialName.title,
            description: req.body.description
                ? req.body.description
                : previousMaterialName.description,
            slug: req.body.slug ? req.body.slug : previousMaterialName.slug,
            materialGrades: req.body.selectedIds
                ? req.body.selectedIds
                : previousMaterialName.materialGrades,
        };
        if (req.body.image) {
            const imgId = previousMaterialName.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
            const newImg = yield cloudinary_1.default.uploader.upload(req.body.image, {
                folder: "materialnames",
            });
            updatedMaterialName.image = {
                public_id: newImg.public_id,
                url: newImg.secure_url,
            };
        }
        const newMaterialGroup = yield (0, materialNames_1.updateMaterialNameById)(id, updatedMaterialName);
        return res.status(200).json(newMaterialGroup).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.updateMaterialName = updateMaterialName;
