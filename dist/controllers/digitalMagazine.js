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
exports.updateMagazine = exports.deleteMagazine = exports.getSingleMagazine = exports.getAllDigitalMagazine = exports.createMagazine = void 0;
const digitalMagazine_1 = require("../db/digitalMagazine");
const googleDrive_1 = require("../utils/googleDrive");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const slugify_1 = __importDefault(require("slugify"));
/**
 * @desc Create a new Digital Magazine
 * @route POST /api/digitalMagazine
 */
const createMagazine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // ✅ Upload Cover Image
        const imageResult = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "digitalMagazine",
            timeout: 60000
        });
        const pdfDriveResult = yield (0, googleDrive_1.uploadPDFtoDrive)(req.body.pdf, // base64 string
        `${(0, slugify_1.default)(req.body.title)}.pdf`);
        const pdf = {
            public_id: pdfDriveResult.id,
            url: `https://drive.google.com/uc?export=download&id=${pdfDriveResult.id}`
        };
        // ✅ Parse and Save Only Manually Entered Pages
        const pagesArray = Array.isArray(req.body.pages)
            ? req.body.pages.map((page) => Number(page)) // Convert each item to a number
            : [];
        // If no pages provided, store an empty array
        // ✅ Upload Editorial Image
        let editorialImageResult = null;
        if ((_a = req.body.editorial) === null || _a === void 0 ? void 0 : _a.image) {
            editorialImageResult = yield cloudinary_1.default.uploader.upload(req.body.editorial.image, {
                folder: "digitalMagazine/editorial",
                timeout: 60000
            });
        }
        // ✅ Upload Advertisements
        const advertisementUrls = req.body.advertisements && Array.isArray(req.body.advertisements)
            ? yield Promise.all(req.body.advertisements.map((ad) => __awaiter(void 0, void 0, void 0, function* () {
                const adUpload = yield cloudinary_1.default.uploader.upload(ad, {
                    folder: "digitalMagazine/advertisements",
                    timeout: 60000
                });
                return { public_id: adUpload.public_id, url: adUpload.secure_url };
            })))
            : [];
        // ✅ Upload Collectors' Images
        const uploadedCollectors = req.body.collectors && Array.isArray(req.body.collectors)
            ? yield Promise.all(req.body.collectors.map((collector) => __awaiter(void 0, void 0, void 0, function* () {
                return ({
                    name: collector.name,
                    images: yield Promise.all(collector.images.map((img) => __awaiter(void 0, void 0, void 0, function* () {
                        const imgUpload = yield cloudinary_1.default.uploader.upload(img, {
                            folder: "digitalMagazine/collectors",
                            timeout: 60000
                        });
                        return { public_id: imgUpload.public_id, url: imgUpload.secure_url };
                    }))),
                });
            })))
            : [];
        // ✅ Process Topics
        const topics = req.body.topics && Array.isArray(req.body.topics)
            ? req.body.topics.map((t) => ({
                topic: t.topic,
                page: t.page,
            }))
            : [];
        // ✅ Create and Save Magazine in Database
        const newMagazine = yield (0, digitalMagazine_1.createNewMagazine)({
            title: req.body.title,
            description: req.body.description,
            year: req.body.year,
            month: req.body.month,
            number: req.body.number,
            slug: req.body.slug
                ? (0, slugify_1.default)(req.body.slug, { lower: true, strict: true })
                : (0, slugify_1.default)(req.body.title, { lower: true, strict: true }),
            topics, // ✅ Save Topics Correctly
            pages: pagesArray, // ✅ Save Only Manually Selected Pages
            image: { public_id: imageResult.public_id, url: imageResult.secure_url },
            pdf,
            advertisements: advertisementUrls,
            editorial: {
                name: ((_b = req.body.editorial) === null || _b === void 0 ? void 0 : _b.name) || "",
                text: ((_c = req.body.editorial) === null || _c === void 0 ? void 0 : _c.text) || "",
                image: editorialImageResult
                    ? { public_id: editorialImageResult.public_id, url: editorialImageResult.secure_url }
                    : null,
            },
            collectors: uploadedCollectors,
        });
        return res.status(201).json(newMagazine);
    }
    catch (error) {
        console.error("🚨 Error creating magazine:", error);
        return res.status(400).json({ message: "Failed to create magazine" });
    }
});
exports.createMagazine = createMagazine;
/**
 * @desc Get all Digital Magazines
 * @route GET /api/digitalMagazine
 */
const getAllDigitalMagazine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const digitalMagazines = yield (0, digitalMagazine_1.getDigitalMagazine)();
        return res.status(200).json(digitalMagazines);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
});
exports.getAllDigitalMagazine = getAllDigitalMagazine;
/**
 * @desc Get a single Digital Magazine by ID
 * @route GET /api/digitalMagazine/:id
 */
const getSingleMagazine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const magazine = yield (0, digitalMagazine_1.getMagazineById)(id);
        if (!magazine) {
            return res.status(404).json({ error: "Magazine not found" });
        }
        return res.status(200).json(magazine);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
});
exports.getSingleMagazine = getSingleMagazine;
/**
 * @desc Delete a Digital Magazine
 * @route DELETE /api/digitalMagazine/:id
 */
const deleteMagazine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const deletedMagazine = yield (0, digitalMagazine_1.deleteMagazineById)(id);
        if (!deletedMagazine) {
            return res.status(404).json({ message: "Magazine not found" });
        }
        // Delete images from Cloudinary
        if ((_a = deletedMagazine.image) === null || _a === void 0 ? void 0 : _a.public_id)
            yield cloudinary_1.default.uploader.destroy(deletedMagazine.image.public_id);
        if ((_b = deletedMagazine.pdf) === null || _b === void 0 ? void 0 : _b.public_id)
            yield cloudinary_1.default.uploader.destroy(deletedMagazine.pdf.public_id, { resource_type: "raw" });
        if (deletedMagazine.advertisements) {
            yield Promise.all(deletedMagazine.advertisements.map((ad) => __awaiter(void 0, void 0, void 0, function* () {
                if (ad.public_id)
                    yield cloudinary_1.default.uploader.destroy(ad.public_id);
            })));
        }
        if ((_c = deletedMagazine.editorial) === null || _c === void 0 ? void 0 : _c.public_id) {
            yield cloudinary_1.default.uploader.destroy(deletedMagazine.editorial.public_id);
        }
        if (deletedMagazine.collectors) {
            yield Promise.all(deletedMagazine.collectors.map((collector) => __awaiter(void 0, void 0, void 0, function* () {
                yield Promise.all(collector.images.map((img) => __awaiter(void 0, void 0, void 0, function* () {
                    if (img.public_id)
                        yield cloudinary_1.default.uploader.destroy(img.public_id);
                })));
            })));
        }
        return res.status(200).json({ message: "Magazine deleted successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Failed to delete magazine" });
    }
});
exports.deleteMagazine = deleteMagazine;
/**
 * @desc Update a Digital Magazine
 * @route PUT /api/digitalMagazine/:id
 */
const updateMagazine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        if (updatedData.image) {
            const imageResult = yield cloudinary_1.default.uploader.upload(updatedData.image, { folder: "digitalMagazine" });
            updatedData.image = { public_id: imageResult.public_id, url: imageResult.secure_url };
        }
        if (updatedData.pdf) {
            const pdfResult = yield cloudinary_1.default.uploader.upload(updatedData.pdf, { folder: "digitalMagazine", resource_type: "raw" });
            updatedData.pdf = { public_id: pdfResult.public_id, url: pdfResult.secure_url };
        }
        const updatedMagazine = yield (0, digitalMagazine_1.updateMagazineById)(id, updatedData);
        if (!updatedMagazine) {
            return res.status(404).json({ message: "Magazine not found" });
        }
        return res.status(200).json(updatedMagazine);
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Failed to update magazine" });
    }
});
exports.updateMagazine = updateMagazine;
