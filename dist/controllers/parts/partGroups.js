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
exports.updatePartGroup = exports.createPartGroup = exports.deletePartGroup = exports.getAllPartGroups = void 0;
const partGroups_1 = require("../../db/parts/partGroups");
const cloudinary_1 = __importDefault(require("../../utils/cloudinary"));
const getAllPartGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const partGroups = yield (0, partGroups_1.getPartGroups)();
        return res.status(200).json(partGroups);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllPartGroups = getAllPartGroups;
const deletePartGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedPartGroup = yield (0, partGroups_1.deletePartGroupById)(id);
        if (deletedPartGroup.image) {
            const imgId = deletedPartGroup.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
        }
        return res.status(200).json("old partGroup got deleted").end();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.deletePartGroup = deletePartGroup;
const createPartGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "partGroups",
        });
        const newPartGroup = new partGroups_1.partGroupModel(Object.assign(Object.assign({}, req.body), { image: {
                public_id: result.public_id,
                url: result.secure_url,
            } }));
        yield newPartGroup.save();
        return res.status(200).json(newPartGroup).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createPartGroup = createPartGroup;
const updatePartGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const previousPartGroup = yield partGroups_1.partGroupModel.find({
            _id: id,
        });
        const updatedPartGroup = {
            title: req.body.title ? req.body.title : previousPartGroup === null || previousPartGroup === void 0 ? void 0 : previousPartGroup.title,
            description: req.body.description
                ? req.body.description
                : previousPartGroup === null || previousPartGroup === void 0 ? void 0 : previousPartGroup.description,
            partNames: req.body.selectedIds
                ? req.body.selectedIds
                : previousPartGroup.partNames,
        };
        if (req.body.image) {
            const imgId = previousPartGroup.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
            const newImg = yield cloudinary_1.default.uploader.upload(req.body.image, {
                folder: "partGroups",
            });
            updatedPartGroup.image = {
                public_id: newImg.public_id,
                url: newImg.secure_url,
            };
        }
        const newPartGroup = yield (0, partGroups_1.updatePartGroupById)(id, updatedPartGroup);
        console.log("newPartGroup", newPartGroup);
        return res.status(200).json(newPartGroup).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.updatePartGroup = updatePartGroup;
