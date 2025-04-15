import { google } from "googleapis";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import dotenv from "dotenv";

dotenv.config();

const KEYFILEPATH = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH as string);
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

/**
 * ✅ Uploads a base64 PDF to Google Drive
 */
export const uploadPDFtoDrive = async (base64Data: string, filename: string) => {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");
  const buffer = Buffer.from(cleanBase64, "base64");
    
  const tempPath = path.join(__dirname, `../../temp/${filename}`);
  fs.writeFileSync(tempPath, buffer);

  const fileMetadata = {
    name: filename,
    parents: [folderId],
  };

  const media = {
    mimeType: mime.lookup(filename) || 'application/pdf',
    body: fs.createReadStream(tempPath),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
  });

  // ✅ Make file publicly viewable
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  fs.unlinkSync(tempPath); // 🧹 Delete the temp file

  return {
    id: response.data.id,
    url: `https://drive.google.com/uc?export=download&id=${response.data.id}`, // 👈 Only useful for direct downloads
  };
};

/**
 * ✅ Streams a PDF from Google Drive using the API (used in your /proxy/pdf/:id route)
 */
export const streamPDFfromDrive = async (fileId: string, res: any) => {
  try {
    const fileRes = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

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



