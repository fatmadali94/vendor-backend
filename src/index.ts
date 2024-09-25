import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import helmet from "helmet";
import cors from "cors";

// import dotenv from "dotenv";

import router from "./router";
dotenv.config();

const app = express();

app.use(express.static("public"));
app.use(cookieParser());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(helmet());

app.use(
  cors({
    origin: "*", // Your React app's local address
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

app.use("/server", compression(), router());
