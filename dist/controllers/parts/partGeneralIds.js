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
exports.createPartGeneralId = exports.deletePartGeneralId = exports.getAllPartGeneralIds = void 0;
var mongoose = require("mongoose");
const partGeneralIds_1 = require("../../db/parts/partGeneralIds");
const partGeneralIds_2 = require("../../db/parts/partGeneralIds");
const cloudinary_1 = __importDefault(require("../../utils/cloudinary"));
const getAllPartGeneralIds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const partGeneralIds = yield (0, partGeneralIds_1.getPartGeneralIds)();
        return res.status(200).json(partGeneralIds);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllPartGeneralIds = getAllPartGeneralIds;
const deletePartGeneralId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedPartGeneralId = yield (0, partGeneralIds_1.deletePartGeneralIdById)(id);
        if (deletedPartGeneralId.image) {
            const imgId = deletedPartGeneralId.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
        }
        return res.status(200).json("Part General Id got deleted").end();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.deletePartGeneralId = deletePartGeneralId;
const createPartGeneralId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "partgeneralids",
        });
        const newPartGeneralId = new partGeneralIds_2.partGeneralIdModel(Object.assign(Object.assign({}, req.body), { image: {
                public_id: result.public_id,
                url: result.secure_url,
            } }));
        yield newPartGeneralId.save();
        return res.status(200).json(newPartGeneralId).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createPartGeneralId = createPartGeneralId;
