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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// import helmet from "helmet";
const cors_1 = __importDefault(require("cors"));
const googleDrive_1 = require("./utils/googleDrive"); // ✅ use Drive SDK stream method
const router_1 = __importDefault(require("./router"));
dotenv_1.default.config();
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.static("public"));
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true }));
// app.use(helmet());
app.use((0, compression_1.default)());
app.use((req, res, next) => {
    res.cookie("mycookie", "value", {
        sameSite: "none",
        secure: true,
        httpOnly: true,
    });
    next();
});
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// ✅ Connect to MongoDB
mongoose_1.default.Promise = Promise;
mongoose_1.default.connect(process.env.MONGO_URL, {
    maxPoolSize: 10,
});
mongoose_1.default.connection.on("error", (error) => console.log(error));
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
app.get("/proxy/pdf/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileId = req.params.id;
    yield (0, googleDrive_1.streamPDFfromDrive)(fileId, res); // ✅ use the SDK-based function
}));
// ✅ Your other API routes
app.use("/server", (0, router_1.default)());
