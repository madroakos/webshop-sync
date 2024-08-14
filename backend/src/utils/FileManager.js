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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManager = void 0;
const fs = __importStar(require("fs/promises"));
const Fs = __importStar(require("node:fs"));
const logger_1 = __importDefault(require("../logger"));
const cron_1 = require("cron");
const config_1 = require("../config/config");
class FileManager {
    static createDirectory(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Fs.existsSync(dirPath)) {
                yield fs.mkdir(dirPath, { recursive: true });
                logger_1.default.info(`Directory created: ${dirPath}`);
            }
        });
    }
    static doesDirectoryExist(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.access(dirPath);
                logger_1.default.info(`Directory exists: ${dirPath}`);
                return true;
            }
            catch (_b) {
                logger_1.default.info(`Directory does not exist: ${dirPath}`);
                return false;
            }
        });
    }
    static doesFileExist(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.access(filePath);
                logger_1.default.info(`File exists: ${filePath}`);
                return true;
            }
            catch (_b) {
                logger_1.default.info(`File does not exist: ${filePath}`);
                return false;
            }
        });
    }
    static deleteOldFiles(dirPath, days) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield _a.doesDirectoryExist(dirPath)))
                return;
            const files = yield fs.readdir(dirPath);
            const currentTime = Date.now();
            const millisecondsInADay = 86400000;
            const millisecondsInDays = days * millisecondsInADay;
            for (const file of files) {
                const filePath = `${dirPath}/${file}`;
                const fileStats = yield fs.stat(filePath);
                const fileAge = currentTime - fileStats.mtime.getTime();
                if (fileAge > millisecondsInDays) {
                    yield fs.unlink(filePath);
                    logger_1.default.info(`Deleted file: ${filePath}`);
                }
            }
        });
    }
    static cleanupJunk() {
        return __awaiter(this, void 0, void 0, function* () {
            yield _a.deleteOldFiles(config_1.config.logs.logDir, 7);
            yield _a.deleteOldFiles(config_1.config.backups.backupDir, 7);
            yield _a.deleteOldFiles(config_1.config.exportedXLSX.xlsxDir, 7);
        });
    }
}
exports.FileManager = FileManager;
_a = FileManager;
FileManager.deleteOldFilesCronjob = new cron_1.CronJob("0 1 * * 1", () => __awaiter(void 0, void 0, void 0, function* () { }));
