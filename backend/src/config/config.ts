import path from "path";

const privateConfig = {
  webshopUrl: "https://example.com",
};

export const config = {
  port: 5657,
  fetchUrls: {
    login: `${privateConfig.webshopUrl}/login`,
    backup: `${privateConfig.webshopUrl}/getProductDB`,
    priceXml: "https://example.com",
    productXml: "https://example.com",
    setProduct: `${privateConfig.webshopUrl}/setProduct`,
    setProductDB: `${privateConfig.webshopUrl}/setProductDB`,
  },
  externalWebshopFiles: {
    externalWebshopFilesDir: path.join(__dirname, "..", "externalWebshopFiles"),
    productXml: path.join(__dirname, "..", "externalWebshopFiles", "product.xml"),
    priceXml: path.join(__dirname, "..", "externalWebshopFiles", "price.xml"),
    lastExecution: path.join(
      __dirname,
      "..",
      "externalWebshopFiles",
      "lastExecution.json",
    ),
    categories: path.join(__dirname, "..", "externalWebshopFiles", "categories.json"),
    producers: path.join(__dirname, "..", "externalWebshopFiles", "producers.json"),
  },
  logs: {
    logDir: path.join(__dirname, "..", "logs"),
    applicationLog: path.join(__dirname, "..", "logs", "application.log"),
    uploadLog: path.join(__dirname, "..", "logs", "upload.log"),
    uploadLogWithoutExtension: path.join(__dirname, "..", "logs", "upload"),
  },
  backups: {
    backupDir: path.join(__dirname, "..", "backups"),
  },
  exportedXLSX: {
    xlsxDir: path.join(__dirname, "..", "exportedXLSX"),
  },
  webshop: {
    webshopFolder: path.join(__dirname, "..", "Webshop"),
    existingProducts: path.join(
      __dirname,
      "..",
      "Webshop",
      "existingProducts.json",
    ),
  },
  tokenFilePath: path.join(__dirname, "..", "Webshop", "token.json"),
};
