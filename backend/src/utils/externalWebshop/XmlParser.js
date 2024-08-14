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
exports.XmlParser = void 0;
const xml2js = __importStar(require("xml2js"));
const index_1 = require("../../index");
const promises_1 = __importDefault(require("fs/promises"));
const logger_1 = __importDefault(require("../../logger"));
class XmlParser {
    static readProductsXml(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const productsFull = [];
            try {
                logger_1.default.info("Reading products.xml file");
                const data = yield promises_1.default.readFile(filePath, "utf-8");
                xml2js.parseString(data, (err, result) => {
                    if (err) {
                        logger_1.default.error(err);
                        return;
                    }
                    result.offer.products[0].product.forEach((element) => {
                        var _a, _b;
                        let name = "";
                        let shortDescription = "";
                        if (element.description && ((_a = element.description[0]) === null || _a === void 0 ? void 0 : _a.name)) {
                            element.description[0].name.some((nameElement) => {
                                if (nameElement.$["xml:lang"] === "hun") {
                                    name = nameElement._;
                                }
                            });
                        }
                        if (element.description && ((_b = element.description[0]) === null || _b === void 0 ? void 0 : _b.long_desc)) {
                            element.description[0].long_desc.some((shortDescriptionElement) => {
                                if (shortDescriptionElement.$["xml:lang"] === "hun") {
                                    shortDescription = shortDescriptionElement._;
                                }
                            });
                        }
                        let imageURL = "";
                        if (name !== undefined &&
                            shortDescription !== undefined &&
                            element.images &&
                            element.images[0].large &&
                            element.images[0].large[0].image) {
                            const imageURLs = element.images[0].large[0].image.map((image) => image.$.url);
                            imageURL = imageURLs.join("|");
                        }
                        if (name && shortDescription && imageURL) {
                            const sefUrl = (element.producer[0].$.name +
                                "/" +
                                element.$.id).replace(/[& ]/g, "_");
                            const category = index_1.categoriesHash[element.category[0].$.name]
                                ? index_1.categoriesHash[element.category[0].$.name]
                                : "TESZT";
                            productsFull.push({
                                product_id: element.$.id,
                                articleNumber: "ABC-" + element.$.id,
                                producer: element.producer[0].$.name,
                                category: category,
                                unit: "db",
                                name: name,
                                short_description: shortDescription,
                                weight_full: Number.parseFloat(element.sizes[0].size[0].$.weight),
                                weight_net: Number.parseFloat(element.sizes[0].size[0].$["iaiext:weight_net"]),
                                barcode: element.sizes[0].size[0].$["iaiext:code_external"],
                                sef_url: sefUrl,
                                image_link: imageURL,
                                product_available: 0,
                                explicit: category.toLowerCase().includes("erotika") ? 1 : 0,
                            });
                        }
                    });
                });
            }
            catch (err) {
                logger_1.default.error(err);
            }
            logger_1.default.info("products.xml file read");
            return productsFull;
        });
    }
    static readPricesXml(filePath, productsFull) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info("Reading prices.xml file");
                const data = yield promises_1.default.readFile(filePath, "utf-8");
                xml2js.parseString(data, (err, result) => {
                    if (err) {
                        logger_1.default.error(err);
                        return;
                    }
                    const temp = result.offer.products[0].product;
                    productsFull.forEach((product) => {
                        const matchingProduct = temp.find((tempProduct) => tempProduct.$.id === product.product_id);
                        if (matchingProduct) {
                            if (matchingProduct.srp === undefined) {
                                product.price_net = 0;
                                product.price_br = 0;
                                product.quantity = 0;
                            }
                            else {
                                const priceBr = Math.round(Number.parseFloat(matchingProduct.srp[0].$.net) * 1.27);
                                product.price_net = Number.parseFloat(matchingProduct.srp[0].$.net);
                                product.price_br = priceBr;
                                product.quantity = Number.parseInt(matchingProduct.sizes[0].size[0].stock[0].$.quantity);
                                if (product.category !== "TESZT") {
                                    product.product_available = 1;
                                }
                            }
                        }
                        else {
                            product.price_net = 0;
                            product.price_br = 0;
                            product.quantity = 0;
                        }
                    });
                });
            }
            catch (err) {
                logger_1.default.error(err);
            }
            logger_1.default.info("prices.xml file read");
            return productsFull;
        });
    }
}
exports.XmlParser = XmlParser;
