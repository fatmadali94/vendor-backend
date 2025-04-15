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
exports.updatePartName = exports.createPartName = exports.deletePartName = exports.getAllPartNames = void 0;
var mongoose = require("mongoose");
const partNames_1 = require("../../db/parts/partNames");
const partNames_2 = require("../../db/parts/partNames");
const cloudinary_1 = __importDefault(require("../../utils/cloudinary"));
const getAllPartNames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const partNames = yield (0, partNames_1.getPartNames)();
        return res.status(200).json(partNames);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllPartNames = getAllPartNames;
const deletePartName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedPartName = yield (0, partNames_1.deletePartNameById)(id);
        if (deletedPartName.image) {
            const imgId = deletedPartName.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
        }
        return res.status(200).json("partName got deleted").end();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.deletePartName = deletePartName;
const createPartName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "partnames",
        });
        // const url = req.protocol + "://" + req.get("host");
        const newPartName = new partNames_2.partNameModel(Object.assign(Object.assign({}, req.body), { image: {
                public_id: result.public_id,
                url: result.secure_url,
            } }));
        yield newPartName.save();
        return res.status(200).json(newPartName).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createPartName = createPartName;
const updatePartName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const previousPartName = yield partNames_2.partNameModel.find({
            _id: id,
        });
        const updatedPartName = {
            title: req.body.title ? req.body.title : previousPartName === null || previousPartName === void 0 ? void 0 : previousPartName.title,
            description: req.body.description
                ? req.body.description
                : previousPartName === null || previousPartName === void 0 ? void 0 : previousPartName.description,
            partGeneralIds: req.body.selectedIds
                ? req.body.selectedIds
                : previousPartName.partGeneralIds,
        };
        if (req.body.image) {
            const imgId = previousPartName.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
            const newImg = yield cloudinary_1.default.uploader.upload(req.body.image, {
                folder: "partNames",
            });
            updatedPartName.image = {
                public_id: newImg.public_id,
                url: newImg.secure_url,
            };
        }
        const newPartName = yield (0, partNames_1.updatePartNameById)(id, updatedPartName);
        console.log("newPartName", newPartName);
        return res.status(200).json(newPartName).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.updatePartName = updatePartName;
