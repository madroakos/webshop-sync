import fs from "fs";
import path from "path";
import pino from "pino";
import { config } from "./config/config";

const logDir = config.logs.logDir;
const logFilePath = path.join(logDir, "application.log");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
  console.log("Log directory created");
}

if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "");
  console.log("Log file created");
}

const logger = pino({
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

export default logger;
