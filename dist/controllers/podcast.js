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
exports.updatePodcast = exports.deletePodcast = exports.getSinglePodcast = exports.getAllPodcast = exports.createPodcast = void 0;
const podcast_1 = require("../db/podcast");
const podcast_2 = require("../db/podcast");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const slugify_1 = __importDefault(require("slugify"));
const googleDrive_1 = require("../utils/googleDrive");
const createPodcast = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Upload cover image
        const imageResult = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "podcasts/covers",
            timeout: 60000,
        });
        const audioDriveResult = yield (0, googleDrive_1.uploadAudioToDrive)(req.body.audio, // base64 string
        `${(0, slugify_1.default)(req.body.title)}.mp3`);
        const audioFile = {
            public_id: audioDriveResult.id,
            url: `https://drive.google.com/uc?export=download&id=${audioDriveResult.id}`,
        };
        // Parse JSON inputs
        const topics = Array.isArray(req.body.topics) ? req.body.topics : [];
        const sponsorsInput = Array.isArray(req.body.sponsors) ? req.body.sponsors : [];
        const narratorInput = Array.isArray(req.body.narrator) ? req.body.narrator : [];
        const sponsors = yield Promise.all(sponsorsInput.map((sponsor) => __awaiter(void 0, void 0, void 0, function* () {
            return ({
                name: sponsor.name,
                images: yield Promise.all(sponsor.images.map((img) => __awaiter(void 0, void 0, void 0, function* () {
                    const uploaded = yield cloudinary_1.default.uploader.upload(img, {
                        folder: "podcasts/sponsors",
                        timeout: 60000,
                    });
                    return { public_id: uploaded.public_id, url: uploaded.secure_url };
                }))),
            });
        })));
        const narrator = yield Promise.all(narratorInput.map((narr) => __awaiter(void 0, void 0, void 0, function* () {
            return ({
                name: narr.name,
                images: yield Promise.all(narr.images.map((img) => __awaiter(void 0, void 0, void 0, function* () {
                    const uploaded = yield cloudinary_1.default.uploader.upload(img, {
                        folder: "podcasts/narrators",
                        timeout: 60000,
                    });
                    return { public_id: uploaded.public_id, url: uploaded.secure_url };
                }))),
            });
        })));
        const podcast = yield (0, podcast_1.createNewPodcast)({
            title: req.body.title,
            description: req.body.description,
            year: req.body.year,
            month: req.body.month,
            number: req.body.number,
            slug: req.body.slug || (0, slugify_1.default)(req.body.title, { lower: true, strict: true }),
            duration: req.body.duration,
            topics,
            category: req.body.category,
            sponsors,
            narrator,
            image: {
                public_id: imageResult.public_id,
                url: imageResult.secure_url,
            },
            audioFile,
        });
        res.status(201).json(podcast);
    }
    catch (error) {
        console.error("🚨 Podcast creation error:", error);
        res.status(500).json({ message: "Failed to create podcast", error });
    }
});
exports.createPodcast = createPodcast;
// export const getAllPodcast = async (req: express.Request, res: express.Response) => {
//   try {
//     const podcasts = await getPodcast();
//     return res.status(200).json(podcasts);
//   } catch (error) {
//     console.error(error);
//     return res.sendStatus(400);
//   }
// };
// GET /api/podcasts?category=usefulKnowledge
const getAllPodcast = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        const podcasts = yield podcast_2.podcastModel
            .find(filter)
            .sort({ createdAt: -1 }); // newest first
        return res.status(200).json(podcasts);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
});
exports.getAllPodcast = getAllPodcast;
const getSinglePodcast = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const podcast = yield (0, podcast_1.getPodcastById)(id);
        if (!podcast) {
            return res.status(404).json({ error: "Podcast not found" });
        }
        return res.status(200).json(podcast);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
});
exports.getSinglePodcast = getSinglePodcast;
const deletePodcast = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const deletedPodcast = yield (0, podcast_1.deletePodcastById)(id);
        if (!deletedPodcast) {
            return res.status(404).json({ message: "Podcast not found" });
        }
        // Delete images from Cloudinary
        if ((_a = deletedPodcast.image) === null || _a === void 0 ? void 0 : _a.public_id)
            yield cloudinary_1.default.uploader.destroy(deletedPodcast.image.public_id);
        if ((_b = deletedPodcast.pdf) === null || _b === void 0 ? void 0 : _b.public_id)
            yield cloudinary_1.default.uploader.destroy(deletedPodcast.pdf.public_id, { resource_type: "raw" });
        if (deletedPodcast.advertisements) {
            yield Promise.all(deletedPodcast.advertisements.map((ad) => __awaiter(void 0, void 0, void 0, function* () {
                if (ad.public_id)
                    yield cloudinary_1.default.uploader.destroy(ad.public_id);
            })));
        }
        if ((_c = deletedPodcast.editorial) === null || _c === void 0 ? void 0 : _c.public_id) {
            yield cloudinary_1.default.uploader.destroy(deletedPodcast.editorial.public_id);
        }
        if (deletedPodcast.collectors) {
            yield Promise.all(deletedPodcast.collectors.map((collector) => __awaiter(void 0, void 0, void 0, function* () {
                yield Promise.all(collector.images.map((img) => __awaiter(void 0, void 0, void 0, function* () {
                    if (img.public_id)
                        yield cloudinary_1.default.uploader.destroy(img.public_id);
                })));
            })));
        }
        return res.status(200).json({ message: "Podcast deleted successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Failed to delete Podcast" });
    }
});
exports.deletePodcast = deletePodcast;
const updatePodcast = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        if (updatedData.image) {
            const imageResult = yield cloudinary_1.default.uploader.upload(updatedData.image, { folder: "podcast" });
            updatedData.image = { public_id: imageResult.public_id, url: imageResult.secure_url };
        }
        if (updatedData.pdf) {
            const pdfResult = yield cloudinary_1.default.uploader.upload(updatedData.pdf, { folder: "podcast", resource_type: "raw" });
            updatedData.pdf = { public_id: pdfResult.public_id, url: pdfResult.secure_url };
        }
        const updatedPodcast = yield (0, podcast_1.updatePodcastById)(id, updatedData);
        if (!updatedPodcast) {
            return res.status(404).json({ message: "Podcast not found" });
        }
        return res.status(200).json(updatedPodcast);
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Failed to update Podcast" });
    }
});
exports.updatePodcast = updatePodcast;
