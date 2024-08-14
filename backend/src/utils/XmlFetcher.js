"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.XmlFetcher = void 0;
const axios_1 = __importDefault(require("axios"));
const FileManager_1 = require("./FileManager");
const logger_1 = __importDefault(require("../logger"));
const middleware_1 = require("../middleware/middleware");
const xml2js_1 = require("xml2js");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs/promises"));
const Fs = __importStar(require("node:fs"));
const index_1 = require("../index");
const config_1 = require("../config/config");
class XmlFetcher {
    static fetchAndSaveToFile(url, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 500000);
            try {
                const response = yield axios_1.default.get(url, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (response.headers["content-type"] &&
                    response.headers["content-type"].includes("text/html")) {
                    logger_1.default.info("The response is HTML. Continuing with existing file");
                    return false;
                }
                else {
                    const data = response.data;
                    yield FileManager_1.FileManager.createDirectory(path_1.default.dirname(filePath));
                    yield fs.writeFile(filePath, data, "utf-8");
                    logger_1.default.info(`Data saved to ${filePath}`);
                    return true;
                }
            }
            catch (error) {
                if (axios_1.default.isCancel(error)) {
                    logger_1.default.error("Request was aborted, continuing with existing file");
                }
                else {
                    logger_1.default.error("Error fetching or saving data:", error);
                }
                return false;
            }
        });
    }
    static fetchBackupFile(url, filePath, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const responseForLink = yield middleware_1.axiosWithAuth.post(url, body, {
                    headers: {
                        "Content-Type": "application/xml",
                    },
                });
                logger_1.default.info("Requesting backup from database...");
                const data = yield (0, xml2js_1.parseStringPromise)(yield responseForLink.data);
                logger_1.default.info("Data received. Saving to file...");
                const writer = Fs.createWriteStream(filePath);
                const responseForBackup = yield axios_1.default.get(data.getProductDB.Url[0], {
                    responseType: "stream",
                });
                responseForBackup.data.pipe(writer);
                logger_1.default.info(`Data saved to ${filePath}`);
            }
            catch (error) {
                logger_1.default.error("Error fetching or saving data:", error);
            }
        });
    }
    static fetchItemsFromDatabase(url, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info("Requesting items from database...");
                const responseForLink = yield middleware_1.axiosWithAuth.post(url, body, {
                    headers: {
                        "Content-Type": "application/xml",
                    },
                });
                const data = yield (0, xml2js_1.parseStringPromise)(yield responseForLink.data);
                logger_1.default.info("Response received. Fetching domain in response");
                const responseForBackup = yield axios_1.default.get(data.getProductDB.Url[0], {
                    responseType: "text",
                });
                const csvData = responseForBackup.data
                    .split("\n")
                    .map((line) => line.split(";")[0].replace(/^['"]|['"]$/g, ""));
                if (csvData.length === 0) {
                    logger_1.default.warn("No data found in response");
                    return [];
                }
                index_1.existingProducts.add(csvData);
                Fs.writeFileSync(config_1.config.webshop.existingProducts, JSON.stringify([...index_1.existingProducts]));
            }
            catch (error) {
                logger_1.default.error("Error fetching or parsing data:", error);
                return [];
            }
        });
    }
}
exports.XmlFetcher = XmlFetcher;
