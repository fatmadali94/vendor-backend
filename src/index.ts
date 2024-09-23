import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";

// import dotenv from "dotenv";

import router from "./router";
dotenv.config();

const app = express();

app.use(express.static("public"));
app.use(compression());
app.use(cookieParser());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const corsOptions = {
  origin: function (origin: any, callback: any) {
    const allowedOrigins = [
      "https://demo-1.chiliscript.de", // Your live frontend
      "http://localhost:3000", // Your local development frontend
    ];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // If the origin is in the allowed list or it's a server-to-server request (no origin)
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies and credentials
  allowedHeaders: ["Content-Type", "Authorization"], // Allow Authorization header
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allow necessary HTTP methods
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  res.cookie("mycookie", "value", {
    sameSite: "none",
    secure: true,
    httpOnly: true,
  });
  next();
});

const server = http.createServer(app);
const port = 3004;
server.listen(port, () => {
  console.log("server running on http://localhost:3004/");
  console.log("working great");
});

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL! as string);
mongoose.connection.on("error", (error: Error) => console.log(error));

app.use("/server", router());
