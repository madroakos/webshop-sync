import { XmlFetcher } from "./XmlFetcher";
import { FileManager } from "./FileManager";
import logger from "../logger";
import { getFormattedDateTime } from "./helpers";
import { config } from "../config/config";
import fs from "fs";

export class BackupManager {
  static async doBackup() {
    const xmlBody = `<Params>
            <Format>xlsx</Format>
            <Compress>no</Compress>
            <Lang>hu</Lang>
        </Params>`;
    const fileName = `src/Backups/WebshopBackup_${getFormattedDateTime()}.xlsx`;
    await FileManager.createDirectory(config.backups.backupDir);
    await XmlFetcher.fetchBackupFile(
      config.fetchUrls.backup,
      fileName,
      xmlBody,
    );
    logger.info("Backup done. File saved to " + fileName);
  }

  static async getExistingItems() {
    const xmlBody = `<Params>
      <Format>csv2</Format>
      <Compress>no</Compress>
      <Lang>hu</Lang>
      <ContentType>full</ContentType>
      <Order>id</Order>
      <GetName>1</GetName>
    </Params>`;
    await fs.promises.mkdir(config.webshop.webshopFolder, {
      recursive: true,
    });
    await XmlFetcher.fetchItemsFromDatabase(config.fetchUrls.backup, xmlBody);
    logger.info("Existing items fetched");
  }
}
