import * as XLSX from "xlsx";
import path from "path";
import logger from "../../logger";
import { WebshopXlsxProduct } from "../../types/WebshopXlsxProduct";
import base64js from "base64-js";
import { config } from "../../config/config";

export class XlsxManager {
  static async outputXLSX(
    productsFull: WebshopXlsxProduct[],
    sheetName: string,
    fileName: string,
  ) {
    const wb = XLSX.utils.book_new();
    const sheetData = productsFull.map((product) => ({
      Cikkszám: product.articleNumber,
      Státusz: product.product_available,
      "Paraméter: manufacturer_product_number|FB|text": product.product_id,
      "Paraméter: Gyártó/Márka||text": product.producer,
      Kategória: product.category,
      Egység: product.unit,
      "Termék Név": product.name,
      "Rövid leírás": product.short_description,
      "Paraméter: Szállítási idő|SZÁLLÍTÁS|date": "7|day",
      "Paraméter: Árukereső.hu Szállítási Költség|Árukereső|text": "1600",
      "Paraméter: Árukereső.hu Szállítási idő|Árukereső|num": "10",
      "Paraméter: gtin|google|text": product.barcode,
      "Paraméter: Vonalkód||num": product.barcode,
      "Min. Menny.": "1",
      "Vásárolható, ha nincs Raktáron": "0",
      "Ár: Kiemelt 30": "3",
      "Ár típus: Kiemelt 30": "percent",
      "Ár: Viszonteladók": "3",
      "Ár típus: Viszonteladók": "percent",
      "Ár: Viszonteladók 20": "3",
      "Ár típus: Viszonteladók 20": "percent",
      Export: "1",
      Explicit: product.explicit,
      "SEF URL": product.sef_url,
      "Nettó ár": product.price_net,
      "Bruttó Ár": product.price_br,
      Raktárkészlet: product.quantity,
      "Image Link": product.image_link,
      "Export Tiltás": product.explicit ? "facebook_product_feed" : "",
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const exportFilePath = path.join(config.exportedXLSX.xlsxDir, fileName);
    try {
      XLSX.writeFile(wb, exportFilePath);
      logger.info(`File saved to ${exportFilePath}`);
    } catch (err) {
      logger.error(err);
    }
  }

  static convertXlsxToCsv(fileName: string): string {
    const workbook = XLSX.readFile(
      path.join(config.exportedXLSX.xlsxDir, fileName),
    );
    const sheet_name_list = workbook.SheetNames;
    const csvData = XLSX.utils.sheet_to_csv(
      workbook.Sheets[sheet_name_list[0]],
    );
    const csvUint8Array = new TextEncoder().encode(csvData);
    return base64js.fromByteArray(csvUint8Array);
  }
}
