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

// import dotenv from "dotenv";

import router from "./router";
dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://demo-1.chiliscript.de",
    "https://vendor.rierco.net",
    "https://adminvendor.rierco.net",
  ], // Allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type", "Accept"],
};
app.use(cors(corsOptions));

// app.options("*", cors()); // Handle preflight requests

app.use(express.static("public"));
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
const port = 3004;
server.listen(port, () => {
  console.log("server running on http://localhost:3004/");
});

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL! as string, {
  maxPoolSize: 10,
});
mongoose.connection.on("error", (error: Error) => console.log(error));

app.use("/server", router());
