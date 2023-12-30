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
app.use(cors());
app.use(express.static("public"));

app.use(compression());
app.use(cookieParser());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const server = http.createServer(app);
server.listen(8080, () => {
  console.log("server running on http://localhost:8080/");
  console.log("working great");
});

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL!);
mongoose.connection.on("error", (error: Error) => console.log(error));

app.use("/server", router());
