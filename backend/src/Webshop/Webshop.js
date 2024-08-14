"use strict";
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
const config_1 = require("../config/config");
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const apiKey_1 = require("./apiKey");
const xml2js_1 = require("xml2js");
const logger_1 = __importDefault(require("../logger"));
class Webshop {
    constructor() { }
    static getInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Webshop.instance) {
                Webshop.instance = new Webshop();
                yield Webshop.initialize();
            }
            return Webshop.instance;
        });
    }
    static getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Webshop.token === null ||
                new Date() > new Date(Webshop.token.expiration)) {
                yield Webshop.login();
            }
            return Webshop.token;
        });
    }
    static initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield Webshop.isCurrentlyAuthenticated()) {
                if (Webshop.token !== null) {
                    logger_1.default.info("Already existing token loaded. Expiration: " +
                        new Date(Webshop.token.expiration));
                }
                else {
                    yield Webshop.login();
                }
            }
            else {
                yield Webshop.login();
            }
        });
    }
    static isCurrentlyAuthenticated() {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.default.existsSync(config_1.config.tokenFilePath)) {
                const data = fs_1.default.readFileSync(config_1.config.tokenFilePath, "utf8");
                Webshop.token = JSON.parse(data);
                return !!(Webshop.token &&
                    new Date().getTime() < new Date(Webshop.token.expiration).getTime());
            }
            else {
                return false;
            }
        });
    }
    static login() {
        return __awaiter(this, void 0, void 0, function* () {
            const body = {
                ApiKey: apiKey_1.apiKey,
            };
            try {
                const response = yield axios_1.default.post(config_1.config.fetchUrls.login, body, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const result = yield (0, xml2js_1.parseStringPromise)(response.data);
                if (result.Login.Status[0] !== "OK") {
                    Webshop.token = {
                        data: result.Login.Token[0],
                        expiration: new Date(result.Login.Expire[0]),
                    };
                    try {
                        yield fs_1.default.promises.writeFile(config_1.config.tokenFilePath, JSON.stringify(Webshop.token, null, 2), "utf-8");
                        logger_1.default.info("New token saved from /login request");
                    }
                    catch (error) {
                        logger_1.default.error("Error saving received token to file:" + error);
                    }
                }
            }
            catch (error) {
                logger_1.default.error("Error sending login request:", error);
            }
        });
    }
}
Webshop.token = null;
exports.default = Webshop;
