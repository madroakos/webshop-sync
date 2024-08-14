import * as fs from "fs/promises";
import * as Fs from "node:fs";
import logger from "../logger";
import { CronJob } from "cron";
import { config } from "../config/config";

export class FileManager {
  static async createDirectory(dirPath: string): Promise<void> {
    if (!Fs.existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
      logger.info(`Directory created: ${dirPath}`);
    }
  }

  static async doesDirectoryExist(dirPath: string): Promise<boolean> {
    try {
      await fs.access(dirPath);
      logger.info(`Directory exists: ${dirPath}`);
      return true;
    } catch {
      logger.info(`Directory does not exist: ${dirPath}`);
      return false;
    }
  }

  static async doesFileExist(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      logger.info(`File exists: ${filePath}`);
      return true;
    } catch {
      logger.info(`File does not exist: ${filePath}`);
      return false;
    }
  }

  static async deleteOldFiles(dirPath: string, days: number): Promise<void> {
    if (!(await FileManager.doesDirectoryExist(dirPath))) return;
    const files = await fs.readdir(dirPath);
    const currentTime = Date.now();
    const millisecondsInADay = 86400000;
    const millisecondsInDays = days * millisecondsInADay;
    for (const file of files) {
      const filePath = `${dirPath}/${file}`;
      const fileStats = await fs.stat(filePath);
      const fileAge = currentTime - fileStats.mtime.getTime();
      if (fileAge > millisecondsInDays) {
        await fs.unlink(filePath);
        logger.info(`Deleted file: ${filePath}`);
      }
    }
  }

  static async cleanupJunk() {
    await FileManager.deleteOldFiles(config.logs.logDir, 7);
    await FileManager.deleteOldFiles(config.backups.backupDir, 7);
    await FileManager.deleteOldFiles(config.exportedXLSX.xlsxDir, 7);
  }

  static deleteOldFilesCronjob = new CronJob("0 1 * * 1", async () => {});
}
