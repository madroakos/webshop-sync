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
exports.axiosWithAuth = void 0;
exports.authMiddleware = authMiddleware;
const axios_1 = __importDefault(require("axios"));
const Webshop_1 = __importDefault(require("../Webshop/Webshop"));
const logger_1 = __importDefault(require("../logger"));
function authMiddleware(config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = yield Webshop_1.default.getToken();
            if (token && token.data && new Date(token.expiration) > new Date()) {
                config.headers = config.headers || {};
                config.headers["Authorization"] = `Bearer ${token.data}`;
            }
            else {
                logger_1.default.error("Invalid or expired token");
                yield Promise.reject("Invalid or expired token");
            }
            return config;
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
exports.axiosWithAuth = axios_1.default.create();
exports.axiosWithAuth.interceptors.request.use(authMiddleware, (error) => Promise.reject(error));
