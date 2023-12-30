const cloudinary = require("cloudinary").v2;
// import { v2 as cloudinary } from "cloudinary";

const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  //   cloud_name: "djgwmcmoj",
  api_key: process.env.CLOUD_KEY,
  //   api_key: "268187757624725",
  api_secret: process.env.CLOUD_KEY_SECRET,
  //   api_secret: "_oj2OUYaPDfszo9zIqaRr2tCok0",
});
module.exports = cloudinary;
