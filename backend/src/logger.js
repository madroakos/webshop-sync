"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pino_1 = __importDefault(require("pino"));
const config_1 = require("./config/config");
const logDir = config_1.config.logs.logDir;
const logFilePath = path_1.default.join(logDir, "application.log");
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir);
    console.log("Log directory created");
}
if (!fs_1.default.existsSync(logFilePath)) {
    fs_1.default.writeFileSync(logFilePath, "");
    console.log("Log file created");
}
const logger = (0, pino_1.default)({
    level: "info",
    transport: {
        targets: [
            {
                target: "pino/file",
                options: { destination: logFilePath },
            },
            {
                target: "pino-pretty",
                options: { colorize: true },
            },
        ],
    },
});
exports.default = logger;
