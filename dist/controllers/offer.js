"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOffer = exports.getAllOffers = void 0;
const offer_1 = require("../db/offer");
const nodemailer_1 = __importDefault(require("nodemailer"));
var mongoose = require("mongoose");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const getAllOffers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offers = yield (0, offer_1.getOffers)();
        return res.status(200).json(offers);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAllOffers = getAllOffers;
const createOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.uploader.upload(req.body.image, {
            folder: "offer",
        });
        const newOffer = new offer_1.OfferModel(Object.assign(Object.assign({}, req.body), { image: {
                public_id: result.public_id,
                url: result.secure_url,
            } }));
        yield newOffer.save();
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: "fatmadali94@gmail.com",
                pass: "iqia ghue botg xgta",
            },
        });
        const mailOptions = {
            from: "fatmadali94@gmail.com",
            // to: "fatmadali94@gmail.com",
            to: "kasramahsouli@gmail.com",
            subject: "special offer from Vendor.rierco.net",
            text: `\nName: ${req.body.name}\nPosition: ${req.body.position}\n Quantity: ${req.body.quantity}\nVolume: ${req.body.volume}\nEmail: ${req.body.email}\nMessage: ${req.body.description}/nPhone : ${req.body.phone}\n`,
            // attachments: [
            //   {
            //     filename: req.file.originalname,
            //     path: req.file.path
            //   }
            // ]
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.error(err);
                res.status(500).send("Error sending email");
            }
            else {
                console.log(info);
                res.send("Email sent successfully");
            }
        });
        return res.status(200).json(newOffer).end();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
exports.createOffer = createOffer;
