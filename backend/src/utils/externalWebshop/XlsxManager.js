"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XlsxManager = void 0;
const XLSX = __importStar(require("xlsx"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../../logger"));
const base64_js_1 = __importDefault(require("base64-js"));
const config_1 = require("../../config/config");
class XlsxManager {
    static outputXLSX(productsFull, sheetName, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const exportFilePath = path_1.default.join(config_1.config.exportedXLSX.xlsxDir, fileName);
            try {
                XLSX.writeFile(wb, exportFilePath);
                logger_1.default.info(`File saved to ${exportFilePath}`);
            }
            catch (err) {
                logger_1.default.error(err);
            }
        });
    }
    static convertXlsxToCsv(fileName) {
        const workbook = XLSX.readFile(path_1.default.join(config_1.config.exportedXLSX.xlsxDir, fileName));
        const sheet_name_list = workbook.SheetNames;
        const csvData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]]);
        const csvUint8Array = new TextEncoder().encode(csvData);
        return base64_js_1.default.fromByteArray(csvUint8Array);
    }
}
exports.XlsxManager = XlsxManager;
