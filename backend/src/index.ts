import express from "express";
import {
  backupCronjob,
  deleteOldFilesCronjob,
  productsCronjob,
  pricesCronjob,
} from "./cronJobs";
import { config } from "./config/config";
import Webshop from "./Webshop/Webshop";
import logger from "./logger";
import cors from "cors";
import { LastExecutions } from "./types/LastExecutions";
import { WebshopXlsxProduct } from "./types/WebshopXlsxProduct";
import { ApiRequestHandler } from "./utils/ApiRequestHandler";
import fs from "fs";
import { ExternalWebshopManager } from "./utils/ExternalWebshopManager";
import { FileManager } from "./utils/FileManager";
import { BackupManager } from "./utils/BackupManager";

const app = express();
app.use(cors());
app.use(express.json());

export let lastExecution: LastExecutions = {
  productsXml: {
    date: "never",
    successful: false,
  },
  pricesXml: {
    date: "never",
    successful: false,
  },
};
export let categoriesHash: { [key: string]: string } = {};
export let producersSet = new Set<string>();
export let existingProducts = new Set<string>();

app.get("/last-run", ApiRequestHandler.getLastRun);
app.get("/externalwebshop/next/products", ApiRequestHandler.getNextProducts);
app.get("/externalwebshop/next/prices", ApiRequestHandler.getNextPrices);
app.get("/externalwebshop/products", (req, res) =>
  ApiRequestHandler.handleFileDownload(res, config.externalWebshopFiles.productXml, `products`),
);
app.get("/externalwebshop/prices", (req, res) =>
  ApiRequestHandler.handleFileDownload(
    res,
    config.externalWebshopFiles.priceXml,
    `prices`,
  ),
);
app.get("/externalwebshop/categories", ApiRequestHandler.getCategories);
app.get("/externalwebshop/producers", ApiRequestHandler.getProducers);
app.post("/externalwebshop/categories/modify", ApiRequestHandler.modifyCategories);
app.get("/logs", ApiRequestHandler.getLogs);
app.get("/logs/download/:fileName", ApiRequestHandler.downloadLog);
app.get("/backups", ApiRequestHandler.getBackups);
app.get("/backups/download/:fileName", ApiRequestHandler.downloadBackup);
app.get("/xlsx", ApiRequestHandler.getXlsx);
app.get("/xlsx/download/:fileName", ApiRequestHandler.downloadXlsx);

const server = app.listen(config.port, () =>
  console.log(`Server running on port ${config.port}`),
);

process.on("SIGINT", () => {
  server.close(() => {
    logger.info("Server stopped");
    process.exit(0);
  });
});

async function loadLastExecution(): Promise<LastExecutions> {
  if (fs.existsSync(config.externalWebshopFiles.lastExecution)) {
    lastExecution = JSON.parse(
      fs.readFileSync(config.externalWebshopFiles.lastExecution, "utf8"),
    );
    logger.info("Last execution time loaded");
  }
  return lastExecution;
}

export async function writeProducersToFile(productsFull: WebshopXlsxProduct[]) {
  producersSet.clear();
  productsFull.forEach((product) => {
    producersSet.add(product.producer);
  });
  fs.writeFileSync(
    config.externalWebshopFiles.producers,
    JSON.stringify(Array.from(producersSet), null, 2),
  );
  logger.info("Producers saved to file");
}

async function initializeCategories(filePath: string) {
  categoriesHash = {};
  if (!fs.existsSync(filePath)) {
    logger.info("No categories found");
    return;
  }
  const fileContent = fs.readFileSync(filePath, "utf8");
  const categories = JSON.parse(fileContent);

  for (const [key, value] of Object.entries(categories)) {
    if (typeof value === "string") {
      categoriesHash[key] = value;
    }
  }
  if (Object.keys(categoriesHash).length === 0) {
    logger.warn("No categories found");
  } else {
    logger.info("Categories initialized");
  }
}

async function initializeProducers(filePath: string) {
  if (!fs.existsSync(filePath)) {
    logger.info("No producers found");
    return;
  }
  producersSet.clear();
  const fileContent = fs.readFileSync(filePath, "utf8");
  const categories = JSON.parse(fileContent);
  categories.forEach((producer: string) => {
    producersSet.add(producer);
  });
  if (producersSet.size === 0) {
    logger.warn("No producers found");
  } else {
    logger.info("Producers initialized");
  }
}

async function initializeBackupsFolder() {
  if (!fs.existsSync(config.backups.backupDir))
    fs.mkdirSync(config.backups.backupDir);
  logger.info("Backups folder initialized");
}

async function initializeExportedXLSXFolder() {
  if (!fs.existsSync(config.exportedXLSX.xlsxDir))
    fs.mkdirSync(config.exportedXLSX.xlsxDir);
  logger.info("ExportedXLSX folder initialized");
}

async function initializeExistingProducts() {
  if (fs.existsSync(config.webshop.existingProducts)) {
    const fileContent = fs.readFileSync(
      config.webshop.existingProducts,
      "utf8",
    );
    const products = JSON.parse(fileContent);
    products.forEach((product: string) => {
      existingProducts.add(product);
    });
  } else {
    await BackupManager.getExistingItems();
  }
  logger.info("Existing products initialized");
}

(async () => {
  logger.info("Logger initialized at " + config.logs.logDir);
  await FileManager.cleanupJunk();
  await initializeCategories(config.externalWebshopFiles.categories);
  await initializeProducers(config.externalWebshopFiles.producers);
  await initializeExistingProducts();
  await initializeBackupsFolder();
  await initializeExportedXLSXFolder();
  await Webshop.getInstance();
  await BackupManager.doBackup();
  await loadLastExecution();
  await ExternalWebshopManager.fetchProducts().then(ExternalWebshopManager.fetchPrices);

  productsCronjob.start();
  pricesCronjob.start();
  backupCronjob.start();
  deleteOldFilesCronjob.start();
})();
