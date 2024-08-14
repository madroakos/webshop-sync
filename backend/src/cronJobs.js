"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOldFilesCronjob = exports.backupCronjob = exports.productsCronjob = exports.pricesCronjob = void 0;
const ExternalWebshopManager_1 = require("./utils/ExternalWebshopManager");
const FileManager_1 = require("./utils/FileManager");
exports.pricesCronjob = ExternalWebshopManager_1.ExternalWebshopManager.pricesCronjob;
exports.productsCronjob = ExternalWebshopManager_1.ExternalWebshopManager.productsCronjob;
exports.backupCronjob = ExternalWebshopManager_1.ExternalWebshopManager.backupCronjob;
exports.deleteOldFilesCronjob = FileManager_1.FileManager.deleteOldFilesCronjob;
