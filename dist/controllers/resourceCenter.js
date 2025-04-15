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
exports.getResource = exports.createResource = exports.deleteResource = exports.getAllResources = exports.deleteResourceById = exports.getResourceById = exports.getResources = void 0;
var mongoose = require("mongoose");
const resourceCenter_1 = require("../db/resourceCenter");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const getResources = () => resourceCenter_1.ResourceCenterModel.find();
exports.getResources = getResources;
const getResourceById = (id) => resourceCenter_1.ResourceCenterModel.findById(id);
exports.getResourceById = getResourceById;
const deleteResourceById = (id) => resourceCenter_1.ResourceCenterModel.findOneAndDelete({ _id: id });
exports.deleteResourceById = deleteResourceById;
const getAllResources = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resources = yield (0, exports.getResources)();
        return res.status(200).json(resources);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllResources = getAllResources;
const deleteResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedResource = yield (0, exports.deleteResourceById)(id);
        if (deletedResource.image) {
            const imgId = deletedResource.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
        }
        return res.status(200).json("Resource got deleted").end();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.deleteResource = deleteResource;
const createResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "resources",
        });
        const newResource = new resourceCenter_1.ResourceCenterModel(Object.assign(Object.assign({}, req.body), { image: {
                public_id: result.public_id,
                url: result.secure_url,
            } }));
        yield newResource.save();
        return res.status(200).json(newResource).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createResource = createResource;
const getResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const resource = yield (0, exports.getResourceById)(id);
        return res.status(200).json(resource);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.getResource = getResource;
