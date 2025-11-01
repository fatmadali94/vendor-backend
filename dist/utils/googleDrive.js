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
exports.streamAudioFromDrive = exports.uploadAudioToDrive = exports.streamPDFfromDrive = exports.uploadPDFtoDrive = void 0;
// utils/googleDrive.ts
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
const dotenv_1 = __importDefault(require("dotenv"));
const tmp_1 = __importDefault(require("tmp"));
dotenv_1.default.config();
// 🗝️ Auth setup
const KEYFILEPATH = path_1.default.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});
const drive = googleapis_1.google.drive({ version: 'v3', auth });
// 📄 Upload PDF
const uploadPDFtoDrive = (base64Data, filename) => __awaiter(void 0, void 0, void 0, function* () {
    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    // 🔒 Create a temp file that will be automatically cleaned up
    const tempFile = tmp_1.default.fileSync({ postfix: path_1.default.extname(filename) });
    fs_1.default.writeFileSync(tempFile.name, new Uint8Array(buffer));
    const media = {
        mimeType: mime_types_1.default.lookup(filename) || 'application/pdf',
        body: fs_1.default.createReadStream(tempFile.name),
    };
    const fileMetadata = {
        name: filename,
        parents: [process.env.GOOGLE_DRIVE_PDF_FOLDER_ID],
    };
    const response = yield drive.files.create({ requestBody: fileMetadata, media });
    yield drive.permissions.create({
        fileId: response.data.id,
        requestBody: { role: "reader", type: "anyone" },
    });
    // 🔥 Cleanup
    tempFile.removeCallback();
    return {
        id: response.data.id,
        url: `https://drive.google.com/uc?export=download&id=${response.data.id}`,
    };
});
exports.uploadPDFtoDrive = uploadPDFtoDrive;
// 📄 Stream PDF
const streamPDFfromDrive = (fileId, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("📄 Streaming PDF from Drive:", fileId);
        // Attempt to get file metadata first (to check if it exists and is a PDF)
        const fileMeta = yield drive.files.get({ fileId, fields: "mimeType, name" });
        const mimeType = fileMeta.data.mimeType;
        if (mimeType !== "application/pdf") {
            console.error("❌ Not a valid PDF file:", fileMeta.data.name);
            res.status(400).send("The requested file is not a valid PDF.");
            return;
        }
        // Then stream the file
        const fileRes = yield drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
        // ⚠️ Validate that the Drive response is actually a PDF
        const driveContentType = fileRes.headers["content-type"];
        console.log("📎 Google Drive Content-Type:", driveContentType);
        if (!driveContentType || !driveContentType.includes("pdf")) {
            console.warn("❌ Drive did not return a valid PDF");
            res.status(500).send("Invalid file format from Drive");
            return;
        }
        const origin = res.req.headers.origin || "*";
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        fileRes.data
            .on("end", () => {
            console.log("✅ PDF streamed successfully");
        })
            .on("error", (err) => {
            console.error("🚨 Streaming error:", err);
            res.status(500).send("Error streaming PDF");
        })
            .pipe(res);
    }
    catch (error) {
        // Detect specific Drive 404
        if (error.errors && ((_a = error.errors[0]) === null || _a === void 0 ? void 0 : _a.reason) === "notFound") {
            console.warn("❌ PDF file not found on Drive:", fileId);
            res.status(404).send("PDF not found");
        }
        else {
            console.error("🚨 Failed to stream PDF:", error.message);
            res.status(500).send("Could not stream PDF");
        }
    }
});
exports.streamPDFfromDrive = streamPDFfromDrive;
// 🎵 Upload Audio
const uploadAudioToDrive = (base64Data, filename) => __awaiter(void 0, void 0, void 0, function* () {
    if (!base64Data || typeof base64Data !== "string") {
        throw new Error("No base64 audio string provided");
    }
    const matches = base64Data.match(/^data:audio\/\w+;base64,(.+)$/);
    if (!matches) {
        throw new Error("Invalid base64 audio format");
    }
    const buffer = Buffer.from(matches[1], "base64");
    const tempFile = tmp_1.default.fileSync({ postfix: path_1.default.extname(filename) });
    fs_1.default.writeFileSync(tempFile.name, new Uint8Array(buffer));
    const mimeType = mime_types_1.default.lookup(filename) || "audio/mpeg";
    const media = { mimeType, body: fs_1.default.createReadStream(tempFile.name) };
    const fileMetadata = {
        name: filename,
        parents: [process.env.GOOGLE_DRIVE_AUDIO_FOLDER_ID],
    };
    const response = yield drive.files.create({ requestBody: fileMetadata, media });
    yield drive.permissions.create({
        fileId: response.data.id,
        requestBody: { role: "reader", type: "anyone" },
    });
    tempFile.removeCallback();
    const BASE_URL = process.env.SERVER_BASE_URL;
    return {
        id: response.data.id,
        url: `${BASE_URL}/proxy/audio/${response.data.id}`,
    };
});
exports.uploadAudioToDrive = uploadAudioToDrive;
const streamAudioFromDrive = (fileId, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 🔽 Download file to a temp location
        const tempFile = tmp_1.default.fileSync({ postfix: ".mp3" });
        const dest = fs_1.default.createWriteStream(tempFile.name);
        const driveRes = yield drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
        yield new Promise((resolve, reject) => {
            driveRes.data
                .pipe(dest)
                .on("finish", () => {
                console.log("✅ File downloaded successfully");
                resolve(true);
            })
                .on("error", (err) => {
                console.error("❌ Error downloading file from Google Drive:", err.message);
                reject(err);
            });
        });
        // 📏 File size check
        const fileSize = fs_1.default.statSync(tempFile.name).size;
        if (fileSize === 0) {
            console.error("❌ Downloaded file is empty.");
            res.status(500).send("Downloaded file is empty");
            tempFile.removeCallback();
            return;
        }
        // 📡 Parse Range header
        const range = req.headers.range;
        if (!range) {
            console.warn("❌ Missing range header");
            res.status(416).send("Range header required");
            tempFile.removeCallback();
            return;
        }
        const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
        const safeEnd = Math.min(end, fileSize - 1);
        console.log(`📦 File size: ${fileSize}`);
        console.log(`📥 Client requested range: ${start}-${end}, clamped to ${safeEnd}`);
        console.log("🎯 fileId received:", fileId);
        console.log("📨 Range header:", req.headers.range);
        if (isNaN(start) || isNaN(safeEnd) || start >= fileSize || start > safeEnd) {
            console.warn(`❌ Invalid range: requested ${start}-${end}, file size is ${fileSize}`);
            res.status(416).send("Requested range not satisfiable");
            tempFile.removeCallback();
            return;
        }
        const chunkSize = safeEnd - start + 1;
        // 🌐 CORS headers
        const origin = req.headers.origin || "*";
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Range");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        // 🧠 Stream headers
        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${safeEnd}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "audio/mpeg",
            "Content-Disposition": "inline",
        });
        // 🔁 Create stream and send
        const stream = fs_1.default.createReadStream(tempFile.name, { start, end: safeEnd });
        stream.pipe(res);
        stream.on("close", () => {
            console.log("✅ Audio stream completed.");
            tempFile.removeCallback();
        });
        stream.on("error", (err) => {
            console.error("❌ Error streaming file:", err.message);
            res.status(500).send("Error streaming audio");
            tempFile.removeCallback();
        });
    }
    catch (error) {
        console.error("❌ Fatal error in streamAudioFromDrive:", error.message);
        res.status(500).send("Failed to stream audio");
    }
});
exports.streamAudioFromDrive = streamAudioFromDrive;
