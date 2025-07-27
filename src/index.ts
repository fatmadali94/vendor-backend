import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
// import helmet from "helmet";
import cors from "cors";
import { streamPDFfromDrive } from "./utils/googleDrive"; // ✅ use Drive SDK stream method
import { streamAudioFromDrive } from "./utils/googleDrive";
import router from "./router";
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';

dotenv.config();

const app = express();
 
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://demo-1.chiliscript.de",
    "https://demo-2.chiliscript.de",
    "http://localhost:5174",
    "https://vendor.rierco.net",
    "https://adminvendor.rierco.net",   
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type", "Accept"],
};
app.use(cors(corsOptions));

app.use(express.static("public"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());

// app.use(helmet());
app.use(compression());

app.use((req, res, next) => {
  res.cookie("mycookie", "value", {
    sameSite: "none",
    secure: true,
    httpOnly: true,
  });
  next();
});

const server = http.createServer(app);
const PORT = process.env.PORT || 3004;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


// ✅ Connect to MongoDB
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL!, {
  maxPoolSize: 10,
}).then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("❌ MongoDB connection failed:", err);
});
mongoose.connection.on("error", (error: Error) => console.log(error));

// i18next config
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en', // fallback language
    preload: ['en', 'fa', 'ar'], // preload all available languages
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/translation.json')
    }
  });

// Add i18next middleware to Express
app.use(middleware.handle(i18next));



// ✅ Secure and CORS-friendly Google Drive PDF streaming route
app.get("/server/proxy/pdf/:id", async (req, res) => {
  const fileId = req.params.id;
  await streamPDFfromDrive(fileId, res); // ✅ use the SDK-based function
});


app.get("/server/proxy/audio/:id", async (req, res) => {
  const fileId = req.params.id;
  await streamAudioFromDrive(fileId, req, res);
});

// ✅ Your other API routes
app.use("/server", router());