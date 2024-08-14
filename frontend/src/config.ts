const privateConfig = {
  baseUrl: `${window.location.protocol}//${window.location.hostname}:5657`,
};

export const config = {
  fetchUrls: {
    getProductsXml: `${privateConfig.baseUrl}/externalwebshop/full`,
    getPricesXml: `${privateConfig.baseUrl}/externalwebshop/light`,
    getLastExecutions: `${privateConfig.baseUrl}/last-run`,
    getNextProductsExecution: `${privateConfig.baseUrl}/externalwebshop/next/full`,
    getNextPricesExecution: `${privateConfig.baseUrl}/externalwebshop/next/light`,
    getBackupFiles: `${privateConfig.baseUrl}/backups`,
    getSpecificBackupFile: `${privateConfig.baseUrl}/backups/download`,
    getLogs: `${privateConfig.baseUrl}/logs`,
    getSpecificLogFile: `${privateConfig.baseUrl}/logs/download`,
    getXlsxFiles: `${privateConfig.baseUrl}/xlsx`,
    getSpecificXlsxFile: `${privateConfig.baseUrl}/xlsx/download`,
    getCategories: `${privateConfig.baseUrl}/externalwebshop/categories`,
    modifyCategories: `${privateConfig.baseUrl}/externalwebshop/categories/modify`,
  },
};
