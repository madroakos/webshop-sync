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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalWebshopManager = void 0;
const cron_1 = require("cron");
const XmlFetcher_1 = require("./XmlFetcher");
const FileManager_1 = require("./FileManager");
const BackupManager_1 = require("./BackupManager");
const index_1 = require("../index");
const config_1 = require("../config/config");
const logger_1 = __importDefault(require("../logger"));
const XmlParser_1 = require("./externalWebshop/XmlParser");
const XlsxManager_1 = require("./externalWebshop/XlsxManager");
const helpers_1 = require("./helpers");
const WebshopUploader_1 = require("./WebshopUploader");
const fs_1 = __importDefault(require("fs"));
class ExternalWebshopManager {
    static hourlyUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            XmlParser_1.XmlParser.readProductsXml(config_1.config.externalWebshopFiles.productXml).then((products) => {
                if (products.length > 0) {
                    XmlParser_1.XmlParser.readPricesXml(config_1.config.externalWebshopFiles.priceXml, products).then((products) => {
                        XlsxManager_1.XlsxManager.outputXLSX(products, "ExternalWebshop", `ExternalWebshop_${(0, helpers_1.getFormattedDateTime)(new Date())}.xlsx`)
                            .then(BackupManager_1.BackupManager.getExistingItems)
                            .then(() => {
                            let newProducts = [];
                            let existingNumber = 0;
                            let newNumber = 0;
                            let xmlBody = `<Products>`;
                            products.forEach((product) => {
                                let found = false;
                                index_1.existingProducts.forEach((existingProduct) => {
                                    if (existingProduct.indexOf(product.articleNumber) !== -1) {
                                        found = true;
                                    }
                                });
                                if (found) {
                                    existingNumber++;
                                    xmlBody += `<Product><Sku>${product.articleNumber}</Sku><Action>modify</Action><Statuses><Status><Type>base</Type><Value>${product.product_available}</Value></Status></Statuses><Prices><Price><Type>normal</Type><Net>${product.price_net}</Net><Gross>${product.price_br}</Gross></Price></Prices><Stocks><Stock><Qty>${product.quantity}</Qty></Stock></Stocks></Product>`;
                                }
                                else {
                                    newNumber++;
                                    newProducts.push(product);
                                }
                            });
                            xmlBody += `</Products>`;
                            logger_1.default.info(`Number of products: ${products.length}; New: ${newNumber}; Existing: ${existingNumber}`);
                            if (newProducts.length > 0) {
                                const fileName = `ExternalWebshop_${(0, helpers_1.getFormattedDateTime)(new Date())}_newItems.xlsx`;
                                XlsxManager_1.XlsxManager.outputXLSX(newProducts, "Innpro", fileName).then(() => {
                                    const csvData = XlsxManager_1.XlsxManager.convertXlsxToCsv(fileName);
                                    logger_1.default.info("Uploading XLSX to Webshop");
                                    WebshopUploader_1.WebshopUploader.uploadFullProductDatabaseToWebshop(csvData);
                                });
                            }
                            if (existingNumber !== 0) {
                                logger_1.default.info("Uploading XML to Webshop");
                                WebshopUploader_1.WebshopUploader.uploadXmlToWebshop(xmlBody);
                            }
                        });
                    });
                }
            });
        });
    }
    static fetchPrices() {
        return __awaiter(this, void 0, void 0, function* () {
            let shouldFetch = true;
            if (index_1.lastExecution.pricesXml.date !== "never") {
                shouldFetch =
                    new Date(index_1.lastExecution.pricesXml.date).getTime() <
                        new Date().getTime() - 60 * 60 * 1000;
            }
            logger_1.default.info("Should fetch prices.xml:" + shouldFetch);
            if (!(yield FileManager_1.FileManager.doesDirectoryExist(config_1.config.externalWebshopFiles.externalWebshopFilesDir))) {
                yield FileManager_1.FileManager.createDirectory(config_1.config.externalWebshopFiles.externalWebshopFilesDir);
            }
            if (!(yield FileManager_1.FileManager.doesFileExist(config_1.config.externalWebshopFiles.priceXml)) ||
                shouldFetch) {
                logger_1.default.info("Fetching prices.xml");
                index_1.lastExecution.pricesXml.successful = yield XmlFetcher_1.XmlFetcher.fetchAndSaveToFile(config_1.config.fetchUrls.priceXml, config_1.config.externalWebshopFiles.priceXml);
            }
            index_1.lastExecution.pricesXml.date = new Date();
            fs_1.default.writeFileSync(config_1.config.externalWebshopFiles.lastExecution, JSON.stringify(index_1.lastExecution));
            return index_1.lastExecution.pricesXml.successful;
        });
    }
    static fetchProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            let shouldFetch = true;
            if (index_1.lastExecution.productsXml.date !== "never") {
                shouldFetch =
                    new Date(index_1.lastExecution.productsXml.date).getTime() <
                        new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
            }
            logger_1.default.info("Should fetch products.xml:" + shouldFetch);
            if (!(yield FileManager_1.FileManager.doesDirectoryExist(config_1.config.externalWebshopFiles.externalWebshopFilesDir))) {
                yield FileManager_1.FileManager.createDirectory(config_1.config.externalWebshopFiles.externalWebshopFilesDir);
            }
            if (!(yield FileManager_1.FileManager.doesFileExist(config_1.config.externalWebshopFiles.productXml)) ||
                shouldFetch) {
                logger_1.default.info("Fetching products.xml");
                index_1.lastExecution.productsXml.successful = yield XmlFetcher_1.XmlFetcher.fetchAndSaveToFile(config_1.config.fetchUrls.productXml, config_1.config.externalWebshopFiles.productXml);
                index_1.lastExecution.productsXml.date = new Date();
                fs_1.default.writeFileSync(config_1.config.externalWebshopFiles.lastExecution, JSON.stringify(index_1.lastExecution));
            }
        });
    }
}
exports.ExternalWebshopManager = ExternalWebshopManager;
_a = ExternalWebshopManager;
ExternalWebshopManager.pricesCronjob = new cron_1.CronJob("15 */2 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield _a.fetchPrices().then((shouldContinue) => {
        if (shouldContinue) {
            _a.hourlyUpdate();
        }
        else {
            logger_1.default.warn("No changes to update");
        }
    });
}));
ExternalWebshopManager.productsCronjob = new cron_1.CronJob("1 */2 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield _a.fetchProducts();
    const productsFull = yield XmlParser_1.XmlParser.readProductsXml(config_1.config.externalWebshopFiles.productXml);
    yield (0, index_1.writeProducersToFile)(productsFull);
    logger_1.default.info("External Webshop producers saved to file.");
}));
ExternalWebshopManager.backupCronjob = new cron_1.CronJob("0 1 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield BackupManager_1.BackupManager.doBackup();
}));
