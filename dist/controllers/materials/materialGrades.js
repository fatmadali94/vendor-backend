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
exports.createMaterialGrade = exports.deleteMaterialGrade = exports.getAllMaterialGrades = void 0;
var mongoose = require("mongoose");
// const fs = require("fs");
const materialGrades_1 = require("../../db/materials/materialGrades");
const materialGrades_2 = require("../../db/materials/materialGrades");
const cloudinary_1 = __importDefault(require("../../utils/cloudinary"));
const getAllMaterialGrades = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const materialGrades = yield (0, materialGrades_1.getMaterialGrades)();
        return res.status(200).json(materialGrades);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllMaterialGrades = getAllMaterialGrades;
const deleteMaterialGrade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedMaterialGrade = yield (0, materialGrades_1.deleteMaterialGradeById)(id);
        if (deletedMaterialGrade.image) {
            const imgId = deletedMaterialGrade.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
        }
        return res.status(200).json("materialGrade got deleted").end();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.deleteMaterialGrade = deleteMaterialGrade;
const createMaterialGrade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "materialgrades",
        });
        const newMaterialGrade = new materialGrades_2.materialGradeModel(Object.assign(Object.assign({}, req.body), { image: {
                public_id: result.public_id,
                url: result.secure_url,
            } }));
        yield newMaterialGrade.save();
        return res.status(200).json(newMaterialGrade).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createMaterialGrade = createMaterialGrade;
// export const getMaterialGrade = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const { id } = req.params;
//     const product = await getMaterialGradeById(id);
//     return res.status(200).json(product);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(400);
//   }
// };
// export const updateMaterialGrade = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const _id = req.params.id;
//     const oldMaterialGrade: any = await materialGradeModel.findOne({ _id });
//     const updatedMaterialGrade: any = {
//       // ...req.body,
//       title: req.body.title ? req.body.title : oldMaterialGrade.title,
//       description: req.body.description
//         ? req.body.description
//         : oldMaterialGrade.description,
//       slug: req.body.slug ? req.body.slug : oldMaterialGrade.slug,
//       materialnames: req.body.materialnames,
//     };
//     if (oldMaterialGrade.image !== "") {
//       // const imgId = oldMaterialGrade[0].image.public_id;
//       const imgId = oldMaterialGrade.image.public_id;
//       if (imgId) {
//         await cloudinary.uploader.destroy(imgId);
//       }
//       const newImg = await cloudinary.uploader.upload(req.body.image, {
//         folder: "materialgrades",
//       });
//       updatedMaterialGrade.image = {
//         public_id: newImg.public_id,
//         url: newImg.secure_url,
//       };
//     }
//     if (oldMaterialGrade) {
//       Object.assign(oldMaterialGrade, updatedMaterialGrade);
//     }
//     const newMaterialGrade = await oldMaterialGrade!.save();
//     return res.status(200).json(newMaterialGrade).end();
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(400);
//   }
// };
