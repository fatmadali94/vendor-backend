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
exports.getMaterialProvider = exports.createProvider = exports.updateProvider = exports.deleteProvider = exports.getAllMaterialProviders = void 0;
var mongoose = require("mongoose");
const materialProviders_1 = require("../../db/materials/materialProviders");
const providers_1 = require("../../db/providers");
const cloudinary_1 = __importDefault(require("../../utils/cloudinary"));
const getAllMaterialProviders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const providers = yield (0, materialProviders_1.getMaterialProviders)();
        const verifiedMaterialProviders = yield (0, providers_1.getVerifiedMaterialProviders)();
        const allProviders = [...providers, ...verifiedMaterialProviders];
        return res.status(200).json(allProviders);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllMaterialProviders = getAllMaterialProviders;
const deleteProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const provider = yield (0, materialProviders_1.deleteMaterialProviderById)(id);
        if ((_a = provider === null || provider === void 0 ? void 0 : provider.image) === null || _a === void 0 ? void 0 : _a.public_id) {
            yield cloudinary_1.default.uploader.destroy(provider.image.public_id);
        }
        return res.json({
            message: provider ? "Provider deleted successfully" : "Provider already removed",
            provider,
        });
    }
    catch (error) {
        console.error("❌ Error deleting provider:", error);
        return res.sendStatus(400);
    }
});
exports.deleteProvider = deleteProvider;
const updateProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _id = req.params.id;
        const oldProvider = yield materialProviders_1.MaterialProviderModel.findOne({ _id });
        const updatedProvider = {
            name: req.body.name ? req.body.name : oldProvider.name,
            address: req.body.address ? req.body.address : oldProvider.address,
            export_destination: req.body.export_destination
                ? req.body.export_destination
                : oldProvider.export_destination,
            has_export: req.body.has_export !== undefined
                ? req.body.has_export
                : oldProvider.has_export,
            score: req.body.score ? req.body.score : oldProvider.score,
            knowledge_based: req.body.knowledge_based !== undefined
                ? req.body.knowledge_based
                : oldProvider.knowledge_based,
            establish_year: req.body.establish_year
                ? req.body.establish_year
                : oldProvider.establish_year,
            production_type: req.body.production_type
                ? req.body.production_type
                : oldProvider.production_type,
            production_volume: req.body.production_volume
                ? req.body.production_volume
                : oldProvider.production_volume,
            cooperation_length: req.body.cooperation_length
                ? req.body.cooperation_length
                : oldProvider.cooperation_length,
            phone: req.body.phone ? req.body.phone : oldProvider.phone,
            description: req.body.description
                ? req.body.description
                : oldProvider.description,
            link: req.body.link ? req.body.link : oldProvider.link,
            records: req.body.records ? req.body.records : oldProvider.records,
        };
        if (!updatedProvider) {
            return res.sendStatus(400);
        }
        if (oldProvider.image !== "" && req.body.image) {
            const imgId = oldProvider.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
            const newImg = yield cloudinary_1.default.uploader.upload(req.body.image, {
                folder: "providers",
            });
            updatedProvider.image = {
                public_id: newImg.public_id,
                url: newImg.secure_url,
            };
        }
        if (oldProvider) {
            Object.assign(oldProvider, updatedProvider);
        }
        const newProvider = yield oldProvider.save();
        return res.status(200).json(newProvider).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.updateProvider = updateProvider;
const createProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let newProvider = null;
        if (req.body.image) {
            const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
                folder: "providers",
            });
            newProvider = new materialProviders_1.MaterialProviderModel(Object.assign(Object.assign({}, req.body), { image: {
                    public_id: result.public_id,
                    url: result.secure_url,
                } }));
        }
        else {
            newProvider = new materialProviders_1.MaterialProviderModel(Object.assign({}, req.body));
        }
        yield newProvider.save();
        return res.status(200).json(newProvider).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createProvider = createProvider;
const getMaterialProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const provider = yield (0, materialProviders_1.getMaterialProviderById)(id);
        return res.status(200).json(provider);
    }
    catch (error) {
        res.sendStatus(400);
    }
});
exports.getMaterialProvider = getMaterialProvider;
