import { CronJob } from "cron";
import { XmlFetcher } from "./XmlFetcher";
import { FileManager } from "./FileManager";
import { BackupManager } from "./BackupManager";
import {
  existingProducts,
  lastExecution,
  writeProducersToFile,
} from "../index";
import { config } from "../config/config";
import logger from "../logger";
import { XmlParser } from "./externalWebshop/XmlParser";
import { XlsxManager } from "./externalWebshop/XlsxManager";
import { getFormattedDateTime } from "./helpers";
import { WebshopXlsxProduct } from "../types/WebshopXlsxProduct";
import { WebshopUploader } from "./WebshopUploader";
import fs from "fs";

export class ExternalWebshopManager {
  static pricesCronjob = new CronJob("15 */2 * * *", async () => {
    await ExternalWebshopManager.fetchPrices().then((shouldContinue: boolean) => {
      if (shouldContinue) {
        ExternalWebshopManager.hourlyUpdate();
      } else {
        logger.warn("No changes to update");
      }
    });
  });

  static productsCronjob = new CronJob("1 */2 * * *", async () => {
    await ExternalWebshopManager.fetchProducts();
    const productsFull = await XmlParser.readProductsXml(
      config.externalWebshopFiles.productXml,
    );
    await writeProducersToFile(productsFull);
    logger.info("External Webshop producers saved to file.");
  });

  static backupCronjob = new CronJob("0 1 * * *", async () => {
    await BackupManager.doBackup();
  });

  static async hourlyUpdate() {
    XmlParser.readProductsXml(config.externalWebshopFiles.productXml).then((products) => {
      if (products.length > 0) {
        XmlParser.readPricesXml(config.externalWebshopFiles.priceXml, products).then(
          (products) => {
            XlsxManager.outputXLSX(
              products,
              "ExternalWebshop",
              `ExternalWebshop_${getFormattedDateTime(new Date())}.xlsx`,
            )
              .then(BackupManager.getExistingItems)
              .then(() => {
                let newProducts: WebshopXlsxProduct[] = [];
                let existingNumber = 0;
                let newNumber = 0;
                let xmlBody = `<Products>`;
                products.forEach((product) => {
                  let found = false;
                  existingProducts.forEach((existingProduct) => {
                    if (existingProduct.indexOf(product.articleNumber) !== -1) {
                      found = true;
                    }
                  });
                  if (found) {
                    existingNumber++;
                    xmlBody += `<Product><Sku>${product.articleNumber}</Sku><Action>modify</Action><Statuses><Status><Type>base</Type><Value>${product.product_available}</Value></Status></Statuses><Prices><Price><Type>normal</Type><Net>${product.price_net}</Net><Gross>${product.price_br}</Gross></Price></Prices><Stocks><Stock><Qty>${product.quantity}</Qty></Stock></Stocks></Product>`;
                  } else {
                    newNumber++;
                    newProducts.push(product);
                  }
                });
                xmlBody += `</Products>`;
                logger.info(
                  `Number of products: ${products.length}; New: ${newNumber}; Existing: ${existingNumber}`,
                );
                if (newProducts.length > 0) {
                  const fileName = `ExternalWebshop_${getFormattedDateTime(new Date())}_newItems.xlsx`;
                  XlsxManager.outputXLSX(newProducts, "Innpro", fileName).then(
                    () => {
                      const csvData = XlsxManager.convertXlsxToCsv(fileName);
                      logger.info("Uploading XLSX to Webshop");
                      WebshopUploader.uploadFullProductDatabaseToWebshop(csvData);
                    },
                  );
                }
                if (existingNumber !== 0) {
                  logger.info("Uploading XML to Webshop");
                  WebshopUploader.uploadXmlToWebshop(xmlBody);
                }
              });
          },
        );
      }
    });
  }

  static async fetchPrices() {
    let shouldFetch = true;
    if (lastExecution.pricesXml.date !== "never") {
      shouldFetch =
        new Date(lastExecution.pricesXml.date).getTime() <
        new Date().getTime() - 60 * 60 * 1000;
    }
    logger.info("Should fetch prices.xml:" + shouldFetch);

    if (
      !(await FileManager.doesDirectoryExist(config.externalWebshopFiles.externalWebshopFilesDir))
    ) {
      await FileManager.createDirectory(config.externalWebshopFiles.externalWebshopFilesDir);
    }

    if (
      !(await FileManager.doesFileExist(config.externalWebshopFiles.priceXml)) ||
      shouldFetch
    ) {
      logger.info("Fetching prices.xml");
      lastExecution.pricesXml.successful = await XmlFetcher.fetchAndSaveToFile(
        config.fetchUrls.priceXml,
        config.externalWebshopFiles.priceXml,
      );
    }
    lastExecution.pricesXml.date = new Date();
    fs.writeFileSync(
      config.externalWebshopFiles.lastExecution,
      JSON.stringify(lastExecution),
    );
    return lastExecution.pricesXml.successful;
  }

  static async fetchProducts() {
    let shouldFetch = true;
    if (lastExecution.productsXml.date !== "never") {
      shouldFetch =
        new Date(lastExecution.productsXml.date).getTime() <
        new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
    }
    logger.info("Should fetch products.xml:" + shouldFetch);

    if (
      !(await FileManager.doesDirectoryExist(config.externalWebshopFiles.externalWebshopFilesDir))
    ) {
      await FileManager.createDirectory(config.externalWebshopFiles.externalWebshopFilesDir);
    }

    if (
      !(await FileManager.doesFileExist(config.externalWebshopFiles.productXml)) ||
      shouldFetch
    ) {
      logger.info("Fetching products.xml");
      lastExecution.productsXml.successful = await XmlFetcher.fetchAndSaveToFile(
        config.fetchUrls.productXml,
        config.externalWebshopFiles.productXml,
      );
      lastExecution.productsXml.date = new Date();
      fs.writeFileSync(
        config.externalWebshopFiles.lastExecution,
        JSON.stringify(lastExecution),
      );
    }
  }
}
