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
exports.getMarketInfo = exports.createMarketInfo = exports.deleteMarketInfo = exports.getAllMarketInfo = exports.deleteMarketInfoById = exports.getMarketInfoById = exports.getAllMarketInformations = void 0;
var mongoose = require("mongoose");
const marketInformation_1 = require("../db/marketInformation");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const getAllMarketInformations = () => marketInformation_1.MarketInfoModel.find();
exports.getAllMarketInformations = getAllMarketInformations;
const getMarketInfoById = (id) => marketInformation_1.MarketInfoModel.findById(id);
exports.getMarketInfoById = getMarketInfoById;
const deleteMarketInfoById = (id) => marketInformation_1.MarketInfoModel.findOneAndDelete({ _id: id });
exports.deleteMarketInfoById = deleteMarketInfoById;
const getAllMarketInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const marketInfos = yield (0, exports.getAllMarketInformations)();
        return res.status(200).json(marketInfos);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllMarketInfo = getAllMarketInfo;
const deleteMarketInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedMarketInfo = yield (0, exports.deleteMarketInfoById)(id);
        if (deletedMarketInfo.image) {
            const imgId = deletedMarketInfo.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
        }
        return res.status(200).json("Market info got deleted").end();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.deleteMarketInfo = deleteMarketInfo;
const createMarketInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "marketInfos",
        });
        // const url = req.protocol + "://" + req.get("host");
        const newMarketInfo = new marketInformation_1.MarketInfoModel(Object.assign(Object.assign({}, req.body), { image: {
                public_id: result.public_id,
                url: result.secure_url,
            } }));
        yield newMarketInfo.save();
        return res.status(200).json(newMarketInfo).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createMarketInfo = createMarketInfo;
const getMarketInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const marketInfo = yield (0, exports.getMarketInfoById)(id);
        return res.status(200).json(marketInfo);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.getMarketInfo = getMarketInfo;
