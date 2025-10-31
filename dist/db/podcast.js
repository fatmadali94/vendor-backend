"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePodcastById = exports.createNewPodcast = exports.deletePodcastById = exports.getPodcastById = exports.getPodcast = exports.podcastModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../utils/constants");
const podcastSchema = new mongoose_1.default.Schema({
    audioFile: {
        public_id: { type: String }, url: { type: String }
    },
    image: { public_id: { type: String }, url: { type: String } },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    category: {
        type: String,
        enum: constants_1.PODCAST_CATEGORIES,
        required: false,
        index: true,
    },
    year: { type: Number },
    month: { type: String },
    number: { type: Number },
    duration: { type: String },
    topics: [
        {
            topic: { type: String, required: true },
        }
    ],
    sponsors: [{
            name: { type: String },
            images: [{ public_id: { type: String }, url: { type: String } }],
        },
    ],
    narrator: [
        {
            name: { type: String },
            images: [{ public_id: { type: String }, url: { type: String } }],
        },
    ],
}, { timestamps: true });
exports.podcastModel = mongoose_1.default.model("Podcast", podcastSchema);
const getPodcast = () => exports.podcastModel.find();
exports.getPodcast = getPodcast;
const getPodcastById = (id) => exports.podcastModel.findById(id);
exports.getPodcastById = getPodcastById;
const deletePodcastById = (id) => exports.podcastModel.findOneAndDelete({ _id: id });
exports.deletePodcastById = deletePodcastById;
const createNewPodcast = (data) => new exports.podcastModel(data).save(); // ⬅ Renamed to `createNewMagazine`
exports.createNewPodcast = createNewPodcast;
const updatePodcastById = (id, data) => exports.podcastModel.findByIdAndUpdate(id, data, { new: true });
exports.updatePodcastById = updatePodcastById;
