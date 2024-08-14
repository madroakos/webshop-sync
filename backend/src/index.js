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
exports.existingProducts = exports.producersSet = exports.categoriesHash = exports.lastExecution = void 0;
exports.writeProducersToFile = writeProducersToFile;
const express_1 = __importDefault(require("express"));
const cronJobs_1 = require("./cronJobs");
const config_1 = require("./config/config");
const Webshop_1 = __importDefault(require("./Webshop/Webshop"));
const logger_1 = __importDefault(require("./logger"));
const cors_1 = __importDefault(require("cors"));
const ApiRequestHandler_1 = require("./utils/ApiRequestHandler");
const fs_1 = __importDefault(require("fs"));
const ExternalWebshopManager_1 = require("./utils/ExternalWebshopManager");
const FileManager_1 = require("./utils/FileManager");
const BackupManager_1 = require("./utils/BackupManager");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
exports.lastExecution = {
    productsXml: {
        date: "never",
        successful: false,
    },
    pricesXml: {
        date: "never",
        successful: false,
    },
};
exports.categoriesHash = {};
exports.producersSet = new Set();
exports.existingProducts = new Set();
app.get("/last-run", ApiRequestHandler_1.ApiRequestHandler.getLastRun);
app.get("/externalwebshop/next/products", ApiRequestHandler_1.ApiRequestHandler.getNextProducts);
app.get("/externalwebshop/next/prices", ApiRequestHandler_1.ApiRequestHandler.getNextPrices);
app.get("/externalwebshop/products", (req, res) => ApiRequestHandler_1.ApiRequestHandler.handleFileDownload(res, config_1.config.externalWebshopFiles.productXml, `products`));
app.get("/externalwebshop/prices", (req, res) => ApiRequestHandler_1.ApiRequestHandler.handleFileDownload(res, config_1.config.externalWebshopFiles.priceXml, `prices`));
app.get("/externalwebshop/categories", ApiRequestHandler_1.ApiRequestHandler.getCategories);
app.get("/externalwebshop/producers", ApiRequestHandler_1.ApiRequestHandler.getProducers);
app.post("/externalwebshop/categories/modify", ApiRequestHandler_1.ApiRequestHandler.modifyCategories);
app.get("/logs", ApiRequestHandler_1.ApiRequestHandler.getLogs);
app.get("/logs/download/:fileName", ApiRequestHandler_1.ApiRequestHandler.downloadLog);
app.get("/backups", ApiRequestHandler_1.ApiRequestHandler.getBackups);
app.get("/backups/download/:fileName", ApiRequestHandler_1.ApiRequestHandler.downloadBackup);
app.get("/xlsx", ApiRequestHandler_1.ApiRequestHandler.getXlsx);
app.get("/xlsx/download/:fileName", ApiRequestHandler_1.ApiRequestHandler.downloadXlsx);
const server = app.listen(config_1.config.port, () => console.log(`Server running on port ${config_1.config.port}`));
process.on("SIGINT", () => {
    server.close(() => {
        logger_1.default.info("Server stopped");
        process.exit(0);
    });
});
function loadLastExecution() {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs_1.default.existsSync(config_1.config.externalWebshopFiles.lastExecution)) {
            exports.lastExecution = JSON.parse(fs_1.default.readFileSync(config_1.config.externalWebshopFiles.lastExecution, "utf8"));
            logger_1.default.info("Last execution time loaded");
        }
        return exports.lastExecution;
    });
}
function writeProducersToFile(productsFull) {
    return __awaiter(this, void 0, void 0, function* () {
        exports.producersSet.clear();
        productsFull.forEach((product) => {
            exports.producersSet.add(product.producer);
        });
        fs_1.default.writeFileSync(config_1.config.externalWebshopFiles.producers, JSON.stringify(Array.from(exports.producersSet), null, 2));
        logger_1.default.info("Producers saved to file");
    });
}
function initializeCategories(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        exports.categoriesHash = {};
        if (!fs_1.default.existsSync(filePath)) {
            logger_1.default.info("No categories found");
            return;
        }
        const fileContent = fs_1.default.readFileSync(filePath, "utf8");
        const categories = JSON.parse(fileContent);
        for (const [key, value] of Object.entries(categories)) {
            if (typeof value === "string") {
                exports.categoriesHash[key] = value;
            }
        }
        if (Object.keys(exports.categoriesHash).length === 0) {
            logger_1.default.warn("No categories found");
        }
        else {
            logger_1.default.info("Categories initialized");
        }
    });
}
function initializeProducers(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(filePath)) {
            logger_1.default.info("No producers found");
            return;
        }
        exports.producersSet.clear();
        const fileContent = fs_1.default.readFileSync(filePath, "utf8");
        const categories = JSON.parse(fileContent);
        categories.forEach((producer) => {
            exports.producersSet.add(producer);
        });
        if (exports.producersSet.size === 0) {
            logger_1.default.warn("No producers found");
        }
        else {
            logger_1.default.info("Producers initialized");
        }
    });
}
function initializeBackupsFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(config_1.config.backups.backupDir))
            fs_1.default.mkdirSync(config_1.config.backups.backupDir);
        logger_1.default.info("Backups folder initialized");
    });
}
function initializeExportedXLSXFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(config_1.config.exportedXLSX.xlsxDir))
            fs_1.default.mkdirSync(config_1.config.exportedXLSX.xlsxDir);
        logger_1.default.info("ExportedXLSX folder initialized");
    });
}
function initializeExistingProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs_1.default.existsSync(config_1.config.webshop.existingProducts)) {
            const fileContent = fs_1.default.readFileSync(config_1.config.webshop.existingProducts, "utf8");
            const products = JSON.parse(fileContent);
            products.forEach((product) => {
                exports.existingProducts.add(product);
            });
        }
        else {
            yield BackupManager_1.BackupManager.getExistingItems();
        }
        logger_1.default.info("Existing products initialized");
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Logger initialized at " + config_1.config.logs.logDir);
    yield FileManager_1.FileManager.cleanupJunk();
    yield initializeCategories(config_1.config.externalWebshopFiles.categories);
    yield initializeProducers(config_1.config.externalWebshopFiles.producers);
    yield initializeExistingProducts();
    yield initializeBackupsFolder();
    yield initializeExportedXLSXFolder();
    yield Webshop_1.default.getInstance();
    yield BackupManager_1.BackupManager.doBackup();
    yield loadLastExecution();
    yield ExternalWebshopManager_1.ExternalWebshopManager.fetchProducts().then(ExternalWebshopManager_1.ExternalWebshopManager.fetchPrices);
    cronJobs_1.productsCronjob.start();
    cronJobs_1.pricesCronjob.start();
    cronJobs_1.backupCronjob.start();
    cronJobs_1.deleteOldFilesCronjob.start();
}))();
