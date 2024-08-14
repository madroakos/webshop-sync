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
exports.ApiRequestHandler = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../logger"));
const index_1 = require("../index");
const cronJobs_1 = require("../cronJobs");
const config_1 = require("../config/config");
class ApiRequestHandler {
    static handleFileDownload(res_1, filePath_1) {
        return __awaiter(this, arguments, void 0, function* (res, filePath, fileName = "") {
            logger_1.default.info("Requested file: " + filePath);
            if (!fs_1.default.existsSync(filePath)) {
                res.status(404).send("File not found");
            }
            else {
                res.download(filePath, fileName ? `${fileName}.xml` : "");
            }
        });
    }
    static listFiles(dir, ext) {
        return fs_1.default
            .readdirSync(path_1.default.join(__dirname, "..", dir))
            .map((file) => file.replace(ext, ""));
    }
    static modifyCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const newCategories = req.body;
            console.log(newCategories.added);
            console.log(newCategories.deleted);
            if (!Array.isArray(newCategories.added) ||
                !Array.isArray(newCategories.deleted)) {
                return res.status(400).send("Invalid data format");
            }
            newCategories.added.forEach((category) => {
                index_1.categoriesHash[category.originalCategory] = category.modifiedCategory;
            });
            newCategories.deleted.forEach((category) => {
                delete index_1.categoriesHash[category.originalCategory];
            });
            fs_1.default.writeFileSync("src/externalWebshopFiles/categories.json", JSON.stringify(index_1.categoriesHash, null, 2));
            res.status(200).send("Categories added successfully");
        });
    }
    static getLastRun(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.json({
                productsXml: {
                    date: index_1.lastExecution.productsXml.date,
                    successful: index_1.lastExecution.productsXml.successful.toString(),
                },
                pricesXml: {
                    date: index_1.lastExecution.pricesXml.date,
                    successful: index_1.lastExecution.pricesXml.successful.toString(),
                },
            });
        });
    }
    static getNextProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.json({ nextProducts: cronJobs_1.productsCronjob.nextDate().diffNow() });
        });
    }
    static getNextPrices(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.json({ nextPrices: cronJobs_1.pricesCronjob.nextDate().diffNow() });
        });
    }
    static getCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.json(index_1.categoriesHash);
        });
    }
    static getProducers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.json(Array.from(index_1.producersSet));
        });
    }
    static getLogs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.json(ApiRequestHandler.listFiles("logs", ".log"));
        });
    }
    static downloadLog(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            ApiRequestHandler.handleFileDownload(res, `${config_1.config.logs.logDir}/${req.params.fileName}.log`);
        });
    }
    static getBackups(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.json(ApiRequestHandler.listFiles("Backups", ".xlsx"));
        });
    }
    static downloadBackup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            ApiRequestHandler.handleFileDownload(res, `${config_1.config.backups.backupDir}/${req.params.fileName}.xlsx`);
        });
    }
    static getXlsx(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.json(ApiRequestHandler.listFiles("ExportedXLSX", ".xlsx"));
        });
    }
    static downloadXlsx(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            ApiRequestHandler.handleFileDownload(res, `${config_1.config.exportedXLSX.xlsxDir}/${req.params.fileName}.xlsx`);
        });
    }
}
exports.ApiRequestHandler = ApiRequestHandler;
