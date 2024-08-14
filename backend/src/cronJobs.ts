import { ExternalWebshopManager } from "./utils/ExternalWebshopManager";
import { FileManager } from "./utils/FileManager";

export const pricesCronjob = ExternalWebshopManager.pricesCronjob;
export const productsCronjob = ExternalWebshopManager.productsCronjob;
export const backupCronjob = ExternalWebshopManager.backupCronjob;
export const deleteOldFilesCronjob = FileManager.deleteOldFilesCronjob;
