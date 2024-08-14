import { Response, Request } from "express";
import fs from "fs";
import path from "path";
import logger from "../logger";
import { categoriesHash, lastExecution, producersSet } from "../index";
import { productsCronjob, pricesCronjob } from "../cronJobs";
import { config } from "../config/config";

export class ApiRequestHandler {
  static async handleFileDownload(
    res: Response,
    filePath: string,
    fileName = "",
  ) {
    logger.info("Requested file: " + filePath);
    if (!fs.existsSync(filePath)) {
      res.status(404).send("File not found");
    } else {
      res.download(filePath, fileName ? `${fileName}.xml` : "");
    }
  }

  static listFiles(dir: string, ext: string) {
    return fs
      .readdirSync(path.join(__dirname, "..", dir))
      .map((file) => file.replace(ext, ""));
  }

  static async modifyCategories(req: Request, res: Response) {
    const newCategories = req.body;
    console.log(newCategories.added);
    console.log(newCategories.deleted);
    if (
      !Array.isArray(newCategories.added) ||
      !Array.isArray(newCategories.deleted)
    ) {
      return res.status(400).send("Invalid data format");
    }

    newCategories.added.forEach(
      (category: { originalCategory: string; modifiedCategory: string }) => {
        categoriesHash[category.originalCategory] = category.modifiedCategory;
      },
    );

    newCategories.deleted.forEach((category: { originalCategory: string }) => {
      delete categoriesHash[category.originalCategory];
    });
    fs.writeFileSync(
      "src/externalWebshopFiles/categories.json",
      JSON.stringify(categoriesHash, null, 2),
    );
    res.status(200).send("Categories added successfully");
  }

  static async getLastRun(req: Request, res: Response) {
    res.json({
      productsXml: {
        date: lastExecution.productsXml.date,
        successful: lastExecution.productsXml.successful.toString(),
      },
      pricesXml: {
        date: lastExecution.pricesXml.date,
        successful: lastExecution.pricesXml.successful.toString(),
      },
    });
  }

  static async getNextProducts(req: Request, res: Response) {
    res.json({ nextProducts: productsCronjob.nextDate().diffNow() });
  }

  static async getNextPrices(req: Request, res: Response) {
    res.json({ nextPrices: pricesCronjob.nextDate().diffNow() });
  }

  static async getCategories(req: Request, res: Response) {
    res.json(categoriesHash);
  }

  static async getProducers(req: Request, res: Response) {
    res.json(Array.from(producersSet));
  }

  static async getLogs(req: Request, res: Response) {
    res.json(ApiRequestHandler.listFiles("logs", ".log"));
  }

  static async downloadLog(req: Request, res: Response) {
    ApiRequestHandler.handleFileDownload(
      res,
      `${config.logs.logDir}/${req.params.fileName}.log`,
    );
  }

  static async getBackups(req: Request, res: Response) {
    res.json(ApiRequestHandler.listFiles("Backups", ".xlsx"));
  }

  static async downloadBackup(req: Request, res: Response) {
    ApiRequestHandler.handleFileDownload(
      res,
      `${config.backups.backupDir}/${req.params.fileName}.xlsx`,
    );
  }

  static async getXlsx(req: Request, res: Response) {
    res.json(ApiRequestHandler.listFiles("ExportedXLSX", ".xlsx"));
  }

  static async downloadXlsx(req: Request, res: Response) {
    ApiRequestHandler.handleFileDownload(
      res,
      `${config.exportedXLSX.xlsxDir}/${req.params.fileName}.xlsx`,
    );
  }
}
