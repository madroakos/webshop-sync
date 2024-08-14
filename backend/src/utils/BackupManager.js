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
exports.BackupManager = void 0;
const XmlFetcher_1 = require("./XmlFetcher");
const FileManager_1 = require("./FileManager");
const logger_1 = __importDefault(require("../logger"));
const helpers_1 = require("./helpers");
const config_1 = require("../config/config");
const fs_1 = __importDefault(require("fs"));
class BackupManager {
    static doBackup() {
        return __awaiter(this, void 0, void 0, function* () {
            const xmlBody = `<Params>
            <Format>xlsx</Format>
            <Compress>no</Compress>
            <Lang>hu</Lang>
        </Params>`;
            const fileName = `src/Backups/WebshopBackup_${(0, helpers_1.getFormattedDateTime)()}.xlsx`;
            yield FileManager_1.FileManager.createDirectory(config_1.config.backups.backupDir);
            yield XmlFetcher_1.XmlFetcher.fetchBackupFile(config_1.config.fetchUrls.backup, fileName, xmlBody);
            logger_1.default.info("Backup done. File saved to " + fileName);
        });
    }
    static getExistingItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const xmlBody = `<Params>
      <Format>csv2</Format>
      <Compress>no</Compress>
      <Lang>hu</Lang>
      <ContentType>full</ContentType>
      <Order>id</Order>
      <GetName>1</GetName>
    </Params>`;
            yield fs_1.default.promises.mkdir(config_1.config.webshop.webshopFolder, {
                recursive: true,
            });
            yield XmlFetcher_1.XmlFetcher.fetchItemsFromDatabase(config_1.config.fetchUrls.backup, xmlBody);
            logger_1.default.info("Existing items fetched");
        });
    }
}
exports.BackupManager = BackupManager;
