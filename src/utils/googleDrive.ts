// utils/googleDrive.ts
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import dotenv from "dotenv";
import tmp from "tmp";

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
  const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");
  const buffer = Buffer.from(cleanBase64, "base64");
  
  // 🔒 Create a temp file that will be automatically cleaned up
  const tempFile = tmp.fileSync({ postfix: path.extname(filename) });
  fs.writeFileSync(tempFile.name, buffer);

  const media = {
    mimeType: mime.lookup(filename) || 'application/pdf',
    body: fs.createReadStream(tempFile.name),
  };

  const fileMetadata = {
    name: filename,
    parents: [process.env.GOOGLE_DRIVE_PDF_FOLDER_ID],
  };

  const response = await drive.files.create({ requestBody: fileMetadata, media });

  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  // 🔥 Cleanup
  tempFile.removeCallback();

  return {
    id: response.data.id,
    url: `https://drive.google.com/uc?export=download&id=${response.data.id}`,
  };
};

// 📄 Stream PDF
export const streamPDFfromDrive = async (fileId: string, res: any) => {
  try {
    console.log("📄 Streaming PDF from Drive:", fileId);

    // Attempt to get file metadata first (to check if it exists and is a PDF)
    const fileMeta = await drive.files.get({ fileId, fields: "mimeType, name" });
    const mimeType = fileMeta.data.mimeType;

    if (mimeType !== "application/pdf") {
      console.error("❌ Not a valid PDF file:", fileMeta.data.name);
      res.status(400).send("The requested file is not a valid PDF.");
      return;
    }

    // Then stream the file
    const fileRes = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
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
      .on("error", (err: any) => {
        console.error("🚨 Streaming error:", err);
        res.status(500).send("Error streaming PDF");
      })
      .pipe(res);
  } catch (error: any) {
    // Detect specific Drive 404
    if (error.errors && error.errors[0]?.reason === "notFound") {
      console.warn("❌ PDF file not found on Drive:", fileId);
      res.status(404).send("PDF not found");
    } else {
      console.error("🚨 Failed to stream PDF:", error.message);
      res.status(500).send("Could not stream PDF");
    }
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
  const tempFile = tmp.fileSync({ postfix: path.extname(filename) });
  fs.writeFileSync(tempFile.name, buffer);

  const mimeType = mime.lookup(filename) || "audio/mpeg";
  const media = { mimeType, body: fs.createReadStream(tempFile.name) };

  const fileMetadata = {
    name: filename,
    parents: [process.env.GOOGLE_DRIVE_AUDIO_FOLDER_ID], 
  };

  const response = await drive.files.create({ requestBody: fileMetadata, media });

  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  tempFile.removeCallback()

  const BASE_URL = process.env.SERVER_BASE_URL;
  return {
    id: response.data.id,
    url: `${BASE_URL}/proxy/audio/${response.data.id}`,
  };
};



export const streamAudioFromDrive = async (fileId: string, req: any, res: any) => {
  try {

    // 🔽 Download file to a temp location
    const tempFile = tmp.fileSync({ postfix: ".mp3" });
    const dest = fs.createWriteStream(tempFile.name);

    const driveRes = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    await new Promise((resolve, reject) => {
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
    const fileSize = fs.statSync(tempFile.name).size;
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
    const stream = fs.createReadStream(tempFile.name, { start, end: safeEnd });
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

  } catch (error: any) {
    console.error("❌ Fatal error in streamAudioFromDrive:", error.message);
    res.status(500).send("Failed to stream audio");
  }
};
