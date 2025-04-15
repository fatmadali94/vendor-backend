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
exports.streamPDFfromDrive = exports.uploadPDFtoDrive = void 0;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const KEYFILEPATH = path_1.default.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});
const drive = googleapis_1.google.drive({ version: 'v3', auth });
/**
 * ✅ Uploads a base64 PDF to Google Drive
 */
const uploadPDFtoDrive = (base64Data, filename) => __awaiter(void 0, void 0, void 0, function* () {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    const tempPath = path_1.default.join(__dirname, `../../temp/${filename}`);
    fs_1.default.writeFileSync(tempPath, buffer);
    const fileMetadata = {
        name: filename,
        parents: [folderId],
    };
    const media = {
        mimeType: mime_types_1.default.lookup(filename) || 'application/pdf',
        body: fs_1.default.createReadStream(tempPath),
    };
    const response = yield drive.files.create({
        requestBody: fileMetadata,
        media: media,
    });
    // ✅ Make file publicly viewable
    yield drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
            role: "reader",
            type: "anyone",
        },
    });
    fs_1.default.unlinkSync(tempPath); // 🧹 Delete the temp file
    return {
        id: response.data.id,
        url: `https://drive.google.com/uc?export=download&id=${response.data.id}`, // 👈 Only useful for direct downloads
    };
});
exports.uploadPDFtoDrive = uploadPDFtoDrive;
/**
 * ✅ Streams a PDF from Google Drive using the API (used in your /proxy/pdf/:id route)
 */
const streamPDFfromDrive = (fileId, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileRes = yield drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
        const origin = res.req.headers.origin || "*";
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        // ✅ Stream
        fileRes.data
            .on("end", () => {
        })
            .on("error", (err) => {
            console.error("🚨 Streaming error:", err);
            res.status(500).send("Error streaming PDF");
        })
            .pipe(res);
    }
    catch (error) {
        console.error("🚨 Failed to stream PDF:", error.message);
        res.status(500).send("Could not stream PDF");
    }
});
exports.streamPDFfromDrive = streamPDFfromDrive;
