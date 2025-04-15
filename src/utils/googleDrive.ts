// utils/googleDrive.ts
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import dotenv from "dotenv";

dotenv.config();

// 🗝️ Auth setup
const KEYFILEPATH = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH as string);
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

// 📄 Upload PDF
export const uploadPDFtoDrive = async (base64Data: string, filename: string) => {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");
  const buffer = Buffer.from(cleanBase64, "base64");
  const tempPath = path.join(__dirname, `../../temp/${filename}`);
  fs.writeFileSync(tempPath, buffer);

  const media = {
    mimeType: mime.lookup(filename) || 'application/pdf',
    body: fs.createReadStream(tempPath),
  };

  const fileMetadata = {
    name: filename,
    parents: [folderId],
  };

  const response = await drive.files.create({ requestBody: fileMetadata, media });

  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  fs.unlinkSync(tempPath);

  return {
    id: response.data.id,
    url: `https://drive.google.com/uc?export=download&id=${response.data.id}`,
  };
};

// 📄 Stream PDF
export const streamPDFfromDrive = async (fileId: string, res: any) => {
  try {
    const fileRes = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
    const origin = res.req.headers.origin || "*";

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    fileRes.data
      .on("end", () => {})
      .on("error", (err: any) => {
        console.error("🚨 Streaming error:", err);
        res.status(500).send("Error streaming PDF");
      })
      .pipe(res);
  } catch (error: any) {
    console.error("🚨 Failed to stream PDF:", error.message);
    res.status(500).send("Could not stream PDF");
  }
};

// 🎵 Upload Audio
export const uploadAudioToDrive = async (base64Data: string, filename: string) => {
  if (!base64Data || typeof base64Data !== "string") {
    throw new Error("No base64 audio string provided");
  }

  const matches = base64Data.match(/^data:audio\/\w+;base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 audio format");
  }

  const buffer = Buffer.from(matches[1], "base64");
  const tempPath = path.join(__dirname, `../../temp/${filename}`);
  fs.writeFileSync(tempPath, buffer);

  const mimeType = mime.lookup(filename) || "audio/mpeg";
  const media = { mimeType, body: fs.createReadStream(tempPath) };

  const fileMetadata = {
    name: filename,
    parents: ["16oKnPEP5478qeA_K1yr2aob-0DNKKQHk"], 
  };

  const response = await drive.files.create({ requestBody: fileMetadata, media });

  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  fs.unlinkSync(tempPath);

  const BASE_URL = process.env.SERVER_BASE_URL;
  return {
    id: response.data.id,
    url: `${BASE_URL}/proxy/audio/${response.data.id}`,
  };
};

// 🎵 Stream Audio
export const streamAudioFromDrive = async (fileId: string, res: any) => {
  try {
    const fileRes = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
    const origin = res.req.headers.origin || "*";

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Disposition", "inline");

    fileRes.data
      .on("end", () => {})
      .on("error", (err: any) => {
        console.error("🚨 Error streaming audio:", err);
        res.status(500).send("Error streaming audio");
      })
      .pipe(res);
  } catch (error: any) {
    console.error("🚨 Failed to stream audio:", error.message);
    res.status(500).send("Could not stream audio");
  }
};
