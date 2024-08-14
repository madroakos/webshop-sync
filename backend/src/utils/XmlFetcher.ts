import axios from "axios";
import { FileManager } from "./FileManager";
import logger from "../logger";
import { axiosWithAuth } from "../middleware/middleware";
import { parseStringPromise } from "xml2js";
import path from "path";
import * as fs from "fs/promises";
import * as Fs from "node:fs";
import { existingProducts } from "../index";
import { config } from "../config/config";

export class XmlFetcher {
  static async fetchAndSaveToFile(
    url: string,
    filePath: string,
  ): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500000);

    try {
      const response = await axios.get(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (
        response.headers["content-type"] &&
        response.headers["content-type"].includes("text/html")
      ) {
        logger.info("The response is HTML. Continuing with existing file");
        return false;
      } else {
        const data = response.data;
        await FileManager.createDirectory(path.dirname(filePath));
        await fs.writeFile(filePath, data, "utf-8");
        logger.info(`Data saved to ${filePath}`);
        return true;
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        logger.error("Request was aborted, continuing with existing file");
      } else {
        logger.error("Error fetching or saving data:", error);
      }
      return false;
    }
  }

  static async fetchBackupFile(url: string, filePath: string, body?: string) {
    try {
      const responseForLink = await axiosWithAuth.post(url, body, {
        headers: {
          "Content-Type": "application/xml",
        },
      });
      logger.info("Requesting backup from database...");
      const data = await parseStringPromise(await responseForLink.data);
      logger.info("Data received. Saving to file...");
      const writer = Fs.createWriteStream(filePath);
      const responseForBackup = await axios.get(data.getProductDB.Url[0], {
        responseType: "stream",
      });
      responseForBackup.data.pipe(writer);
      logger.info(`Data saved to ${filePath}`);
    } catch (error) {
      logger.error("Error fetching or saving data:", error);
    }
  }

  static async fetchItemsFromDatabase(url: string, body: string) {
    try {
      logger.info("Requesting items from database...");
      const responseForLink = await axiosWithAuth.post(url, body, {
        headers: {
          "Content-Type": "application/xml",
        },
      });
      const data = await parseStringPromise(await responseForLink.data);
      logger.info("Response received. Fetching domain in response");

      const responseForBackup = await axios.get(data.getProductDB.Url[0], {
        responseType: "text",
      });

      const csvData = responseForBackup.data
        .split("\n")
        .map((line: string) => line.split(";")[0].replace(/^['"]|['"]$/g, ""));
      if (csvData.length === 0) {
        logger.warn("No data found in response");
        return [];
      }
      existingProducts.add(csvData);
      Fs.writeFileSync(
        config.webshop.existingProducts,
        JSON.stringify([...existingProducts]),
      );
    } catch (error) {
      logger.error("Error fetching or parsing data:", error);
      return [];
    }
  }
}
