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

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// ✅ Connect to MongoDB
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL! as string, {
  maxPoolSize: 10,
});
mongoose.connection.on("error", (error: Error) => console.log(error));

// ✅ Handle preflight request for the proxy route
app.options("/proxy/pdf/:id", (req, res) => {
  const origin = req.headers.origin;
  if (origin === "http://localhost:5173" || origin === "https://vendor.rierco.net") {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});


// ✅ Secure and CORS-friendly Google Drive PDF streaming route
app.get("/proxy/pdf/:id", async (req, res) => {
  const fileId = req.params.id;
  await streamPDFfromDrive(fileId, res); // ✅ use the SDK-based function
});

// ✅ Secure and CORS-friendly audio streaming route
app.options("/proxy/audio/:id", (req, res) => {
  const origin = req.headers.origin;
  if (origin === "http://localhost:5173" || origin === "https://vendor.rierco.net") {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

app.get("/proxy/audio/:id", async (req, res) => {
  const fileId = req.params.id;
  await streamAudioFromDrive(fileId, res);
});

// ✅ Your other API routes
app.use("/server", router());