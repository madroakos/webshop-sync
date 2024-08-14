"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const path_1 = __importDefault(require("path"));
const privateConfig = {
    webshopUrl: "https://example.com",
};
exports.config = {
    port: 5657,
    fetchUrls: {
        login: `${privateConfig.webshopUrl}/login`,
        backup: `${privateConfig.webshopUrl}/getProductDB`,
        priceXml: "https://example.com",
        productXml: "https://example.com",
        setProduct: `${privateConfig.webshopUrl}/setProduct`,
        setProductDB: `${privateConfig.webshopUrl}/setProductDB`,
    },
    externalWebshopFiles: {
        externalWebshopFilesDir: path_1.default.join(__dirname, "..", "externalWebshopFiles"),
        productXml: path_1.default.join(__dirname, "..", "externalWebshopFiles", "product.xml"),
        priceXml: path_1.default.join(__dirname, "..", "externalWebshopFiles", "price.xml"),
        lastExecution: path_1.default.join(__dirname, "..", "externalWebshopFiles", "lastExecution.json"),
        categories: path_1.default.join(__dirname, "..", "externalWebshopFiles", "categories.json"),
        producers: path_1.default.join(__dirname, "..", "externalWebshopFiles", "producers.json"),
    },
    logs: {
        logDir: path_1.default.join(__dirname, "..", "logs"),
        applicationLog: path_1.default.join(__dirname, "..", "logs", "application.log"),
        uploadLog: path_1.default.join(__dirname, "..", "logs", "upload.log"),
        uploadLogWithoutExtension: path_1.default.join(__dirname, "..", "logs", "upload"),
    },
    backups: {
        backupDir: path_1.default.join(__dirname, "..", "backups"),
    },
    exportedXLSX: {
        xlsxDir: path_1.default.join(__dirname, "..", "exportedXLSX"),
    },
    webshop: {
        webshopFolder: path_1.default.join(__dirname, "..", "Webshop"),
        existingProducts: path_1.default.join(__dirname, "..", "Webshop", "existingProducts.json"),
    },
    tokenFilePath: path_1.default.join(__dirname, "..", "Webshop", "token.json"),
};
