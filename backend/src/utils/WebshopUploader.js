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
exports.WebshopUploader = void 0;
const logger_1 = __importDefault(require("../logger"));
const middleware_1 = require("../middleware/middleware");
const fs = __importStar(require("fs/promises"));
const helpers_1 = require("./helpers");
const xml2js_1 = require("xml2js");
const config_1 = require("../config/config");
class WebshopUploader {
    static uploadFullProductDatabaseToWebshop(csv) {
        return __awaiter(this, void 0, void 0, function* () {
            const xmlBody = `<Params>
          <DB>${csv}</DB>
          <DelType>no</DelType>
          <Lang>hu</Lang>
      </Params>`;
            const url = config_1.config.fetchUrls.setProductDB;
            try {
                const responseForLink = yield middleware_1.axiosWithAuth.post(url, xmlBody, {
                    headers: {
                        "Content-Type": "application/xml",
                    },
                });
                if (responseForLink.status === 200) {
                    const parsedResponse = yield (0, xml2js_1.parseStringPromise)(responseForLink.data);
                    let modifyCount = 0;
                    let addCount = 0;
                    if (parsedResponse.setProductDB.Ok[0].Modify &&
                        parsedResponse.setProductDB.Ok[0].Modify[0]) {
                        modifyCount = parsedResponse.setProductDB.Ok[0].Modify[0];
                    }
                    if (parsedResponse.setProductDB.Ok[0].Add &&
                        parsedResponse.setProductDB.Ok[0].Add[0]) {
                        addCount = parsedResponse.setProductDB.Ok[0].Add[0];
                    }
                    logger_1.default.info("Upload of CSV to Webshop successful");
                    logger_1.default.info(`CSV Response: Modified items: ${modifyCount}; Added items: ${addCount}`);
                }
                else {
                    logger_1.default.warn("Upload of csv to Webshop failed");
                }
                try {
                    yield fs.appendFile(config_1.config.logs.uploadLogWithoutExtension +
                        (0, helpers_1.getFormattedDateTime)() +
                        ".log", (0, helpers_1.getFormattedDateTime)() +
                        "------------------------------------------\n", "utf-8");
                    yield fs.appendFile(config_1.config.logs.uploadLogWithoutExtension +
                        (0, helpers_1.getFormattedDateTime)() +
                        ".log", responseForLink.data + "\n\n", "utf-8");
                }
                catch (error) {
                    logger_1.default.error("Error saving data:" + error);
                }
            }
            catch (error) {
                logger_1.default.error("Error fetching data: " + error);
            }
        });
    }
    static uploadXmlToWebshop(xmlBody) {
        return __awaiter(this, void 0, void 0, function* () {
            const responseForLink = yield middleware_1.axiosWithAuth.post(config_1.config.fetchUrls.setProduct, xmlBody, {
                headers: {
                    "Content-Type": "application/xml",
                },
            });
            if (responseForLink.status === 200) {
                const parsedResponse = yield (0, xml2js_1.parseStringPromise)(responseForLink.data);
                let modifyCount = 0;
                let addCount = 0;
                if (parsedResponse.Products.Product) {
                    parsedResponse.Products.Product.forEach((product) => {
                        if (product.Action[0] === "modify") {
                            modifyCount++;
                        }
                        else if (product.Action[0] === "add") {
                            addCount++;
                        }
                    });
                }
                logger_1.default.info(`XML Response: Modified items: ${modifyCount}; Added items: ${addCount}`);
                logger_1.default.info("Upload of XML to Webshop successful");
            }
            else {
                logger_1.default.warn("Upload of XML to Webshop failed");
            }
            try {
                yield fs.appendFile(config_1.config.logs.uploadLogWithoutExtension + (0, helpers_1.getFormattedDateTime)() + ".log", (0, helpers_1.getFormattedDateTime)() + "------------------------------------------\n", "utf-8");
                yield fs.appendFile(config_1.config.logs.uploadLogWithoutExtension + (0, helpers_1.getFormattedDateTime)() + ".log", responseForLink.data + "\n\n", "utf-8");
            }
            catch (error) {
                logger_1.default.error("Error saving data:" + error);
            }
        });
    }
}
exports.WebshopUploader = WebshopUploader;
