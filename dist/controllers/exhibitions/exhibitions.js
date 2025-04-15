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
exports.getExhibition = exports.createExhibition = exports.updateExhibition = exports.deleteExhibition = exports.getAllExhibitions = void 0;
var mongoose = require("mongoose");
// const fs = require("fs");
const exhibition_1 = require("../../db/exhibition");
const cloudinary_1 = __importDefault(require("../../utils/cloudinary"));
const getAllExhibitions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const exhibitions = yield (0, exhibition_1.getExhibitions)();
        return res.status(200).json(exhibitions);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllExhibitions = getAllExhibitions;
const deleteExhibition = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedMaterialGrade = yield (0, exhibition_1.deleteExhibitionById)(id);
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
exports.deleteExhibition = deleteExhibition;
const updateExhibition = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _id = req.params.id;
        const oldMaterialGrade = yield exhibition_1.ExhibitionModel.findOne({ _id });
        const updatedMaterialGrade = {
            // ...req.body,
            title: req.body.title ? req.body.title : oldMaterialGrade.title,
            description: req.body.description
                ? req.body.description
                : oldMaterialGrade.description,
            slug: req.body.slug ? req.body.slug : oldMaterialGrade.slug,
            materialnames: req.body.materialnames,
        };
        if (oldMaterialGrade.image !== "") {
            // const imgId = oldMaterialGrade[0].image.public_id;
            const imgId = oldMaterialGrade.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
            const newImg = yield cloudinary_1.default.uploader.upload(req.body.image, {
                folder: "materialgrades",
            });
            updatedMaterialGrade.image = {
                public_id: newImg.public_id,
                url: newImg.secure_url,
            };
        }
        if (oldMaterialGrade) {
            Object.assign(oldMaterialGrade, updatedMaterialGrade);
        }
        const newMaterialGrade = yield oldMaterialGrade.save();
        return res.status(200).json(newMaterialGrade).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.updateExhibition = updateExhibition;
const createExhibition = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "exhibition",
        });
        const newExhbition = new exhibition_1.ExhibitionModel(Object.assign(Object.assign({}, req.body), { image: {
                public_id: result.public_id,
                url: result.secure_url,
            } }));
        yield newExhbition.save();
        return res.status(200).json(newExhbition).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createExhibition = createExhibition;
const getExhibition = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield (0, exhibition_1.getExhibitionById)(id);
        return res.status(200).json(product);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.getExhibition = getExhibition;
