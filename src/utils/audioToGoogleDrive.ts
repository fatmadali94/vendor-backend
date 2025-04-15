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

export const uploadAudioToDrive = async (base64Data: string, filename: string) => {

  if (!base64Data || typeof base64Data !== "string") {
    console.error("❌ No base64 audio string provided");
    throw new Error("No base64 audio string provided");
  }

  const matches = base64Data.match(/^data:audio\/\w+;base64,(.+)$/);
  if (!matches) {
    console.error("❌ Invalid base64 format received");
    throw new Error("Invalid base64 audio format");
  }
  const cleanBase64 = matches[1];
  const buffer = Buffer.from(cleanBase64, "base64");

  const tempPath = path.join(__dirname, `../../temp/${filename}`);

  // 📝 Write file
  fs.writeFileSync(tempPath, buffer);

  // 🕵️ Check file existence before trying to read
  if (!fs.existsSync(tempPath)) {
    console.error("❌ Temp file does not exist after write!");
    throw new Error("Temp file was not created");
  }

  const mimeType = mime.lookup(filename) || "audio/mpeg";

  const media = {
    mimeType,
    body: fs.createReadStream(tempPath),
  };

  const fileMetadata = {
    name: filename,
    parents: ["16oKnPEP5478qeA_K1yr2aob-0DNKKQHk"],
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
    });


    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // 🧹 Cleanup
    fs.unlinkSync(tempPath);
    console.log("🧹 Temp file deleted");

    return {
      id: response.data.id,
      url: `http://localhost:3004/proxy/audio/${response.data.id}`,
    };       
  } catch (error) {
    console.error("❌ Google Drive upload failed:", error);
    throw error;
  }
};

export const streamAudioFromDrive = async (fileId: string, res: any) => {
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

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Disposition", "inline");

    fileRes.data
      .on("end", () => {
      })
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

  
