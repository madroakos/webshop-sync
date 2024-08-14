import { config } from "../config/config";
import fs from "fs";
import axios from "axios";
import { apiKey } from "./apiKey";
import { parseStringPromise } from "xml2js";
import logger from "../logger";

interface LoginResponse {
  Login: {
    Token: string[];
    Expire: string[];
    ShopId: string[];
    Subscription: string[];
    Permissions: object[];
    Status: string[];
  };
}

interface token {
  data: string;
  expiration: Date;
}

class Webshop {
  private static instance: Webshop;
  private static token: token | null = null;

  private constructor() {}

  public static async getInstance(): Promise<Webshop> {
    if (!Webshop.instance) {
      Webshop.instance = new Webshop();
      await Webshop.initialize();
    }
    return Webshop.instance;
  }

  public static async getToken(): Promise<token | null> {
    if (
      Webshop.token === null ||
      new Date() > new Date(Webshop.token.expiration)
    ) {
      await Webshop.login();
    }
    return Webshop.token;
  }

  private static async initialize() {
    if (await Webshop.isCurrentlyAuthenticated()) {
      if (Webshop.token !== null) {
        logger.info(
          "Already existing token loaded. Expiration: " +
            new Date(Webshop.token.expiration),
        );
      } else {
        await Webshop.login();
      }
    } else {
      await Webshop.login();
    }
  }

  private static async isCurrentlyAuthenticated(): Promise<boolean> {
    if (fs.existsSync(config.tokenFilePath)) {
      const data = fs.readFileSync(config.tokenFilePath, "utf8");
      Webshop.token = JSON.parse(data);
      return !!(
        Webshop.token &&
        new Date().getTime() < new Date(Webshop.token.expiration).getTime()
      );
    } else {
      return false;
    }
  }

  private static async login() {
    const body = {
      ApiKey: apiKey,
    };

    try {
      const response = await axios.post(config.fetchUrls.login, body, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result: LoginResponse = await parseStringPromise(response.data);

      if (result.Login.Status[0] !== "OK") {
        Webshop.token = {
          data: result.Login.Token[0],
          expiration: new Date(result.Login.Expire[0]),
        };
        try {
          await fs.promises.writeFile(
            config.tokenFilePath,
            JSON.stringify(Webshop.token, null, 2),
            "utf-8",
          );
          logger.info("New token saved from /login request");
        } catch (error) {
          logger.error("Error saving received token to file:" + error);
        }
      }
    } catch (error) {
      logger.error("Error sending login request:", error);
    }
  }
}

export default Webshop;
