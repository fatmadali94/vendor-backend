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
exports.createMaterialGroup = exports.updateMaterialGroup = exports.deleteMaterialGroup = exports.getAllMaterialGroups = void 0;
const materialGroups_1 = require("../../db/materials/materialGroups");
const cloudinary_1 = __importDefault(require("../../utils/cloudinary"));
const getAllMaterialGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const materialGroups = yield (0, materialGroups_1.getMaterialGroups)();
        return res.status(200).json(materialGroups);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllMaterialGroups = getAllMaterialGroups;
const deleteMaterialGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedMaterialGroup = yield (0, materialGroups_1.deleteMaterialGroupById)(id);
        if (deletedMaterialGroup.image) {
            const imgId = deletedMaterialGroup.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
        }
        return res.status(200).json("old materialGroup got deleted").end();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.deleteMaterialGroup = deleteMaterialGroup;
const updateMaterialGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const previousMaterialGroup = yield materialGroups_1.materialGroupModel.find({
            _id: id,
        });
        const updatedMaterialGroup = {
            title: req.body.title ? req.body.title : previousMaterialGroup === null || previousMaterialGroup === void 0 ? void 0 : previousMaterialGroup.title,
            description: req.body.description
                ? req.body.description
                : previousMaterialGroup === null || previousMaterialGroup === void 0 ? void 0 : previousMaterialGroup.description,
            materialNames: req.body.selectedIds
                ? req.body.selectedIds
                : previousMaterialGroup.materialNames,
        };
        if (req.body.image) {
            const imgId = previousMaterialGroup.image.public_id;
            if (imgId) {
                yield cloudinary_1.default.uploader.destroy(imgId);
            }
            const newImg = yield cloudinary_1.default.uploader.upload(req.body.image, {
                folder: "materialGroups",
            });
            updatedMaterialGroup.image = {
                public_id: newImg.public_id,
                url: newImg.secure_url,
            };
        }
        const newMaterialGroup = yield (0, materialGroups_1.updateMaterialGroupById)(id, updatedMaterialGroup);
        return res.status(200).json(newMaterialGroup).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.updateMaterialGroup = updateMaterialGroup;
const createMaterialGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "materialGroups",
        });
        const newMaterialGroup = new materialGroups_1.materialGroupModel(Object.assign(Object.assign({}, req.body), { image: {
                public_id: result.public_id,
                url: result.secure_url,
            } }));
        yield newMaterialGroup.save();
        return res.status(200).json(newMaterialGroup).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createMaterialGroup = createMaterialGroup;
// export const getMaterialGroup = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const { id } = req.params;
//     const materialGroup = await getMaterialGroupById(id);
//     return res.status(200).json(materialGroup);
//   } catch (error) {
//     res.sendStatus(400);
//   }
// };
