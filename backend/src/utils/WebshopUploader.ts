import logger from "../logger";
import { axiosWithAuth } from "../middleware/middleware";
import * as fs from "fs/promises";
import { getFormattedDateTime } from "./helpers";
import { parseStringPromise } from "xml2js";
import { config } from "../config/config";

export class WebshopUploader {
  static async uploadFullProductDatabaseToWebshop(csv: string) {
    const xmlBody = `<Params>
          <DB>${csv}</DB>
          <DelType>no</DelType>
          <Lang>hu</Lang>
      </Params>`;
    const url = config.fetchUrls.setProductDB;
    try {
      const responseForLink = await axiosWithAuth.post(url, xmlBody, {
        headers: {
          "Content-Type": "application/xml",
        },
      });
      if (responseForLink.status === 200) {
        const parsedResponse = await parseStringPromise(responseForLink.data);
        let modifyCount = 0;
        let addCount = 0;
        if (
          parsedResponse.setProductDB.Ok[0].Modify &&
          parsedResponse.setProductDB.Ok[0].Modify[0]
        ) {
          modifyCount = parsedResponse.setProductDB.Ok[0].Modify[0];
        }
        if (
          parsedResponse.setProductDB.Ok[0].Add &&
          parsedResponse.setProductDB.Ok[0].Add[0]
        ) {
          addCount = parsedResponse.setProductDB.Ok[0].Add[0];
        }
        logger.info("Upload of CSV to Webshop successful");
        logger.info(
          `CSV Response: Modified items: ${modifyCount}; Added items: ${addCount}`,
        );
      } else {
        logger.warn("Upload of csv to Webshop failed");
      }
      try {
        await fs.appendFile(
          config.logs.uploadLogWithoutExtension +
            getFormattedDateTime() +
            ".log",
          getFormattedDateTime() +
            "------------------------------------------\n",
          "utf-8",
        );
        await fs.appendFile(
          config.logs.uploadLogWithoutExtension +
            getFormattedDateTime() +
            ".log",
          responseForLink.data + "\n\n",
          "utf-8",
        );
      } catch (error) {
        logger.error("Error saving data:" + error);
      }
    } catch (error) {
      logger.error("Error fetching data: " + error);
    }
  }

  static async uploadXmlToWebshop(xmlBody: string) {
    const responseForLink = await axiosWithAuth.post(
      config.fetchUrls.setProduct,
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
        },
      },
    );
    if (responseForLink.status === 200) {
      const parsedResponse = await parseStringPromise(responseForLink.data);
      let modifyCount = 0;
      let addCount = 0;

      if (parsedResponse.Products.Product) {
        parsedResponse.Products.Product.forEach((product: any) => {
          if (product.Action[0] === "modify") {
            modifyCount++;
          } else if (product.Action[0] === "add") {
            addCount++;
          }
        });
      }
      logger.info(
        `XML Response: Modified items: ${modifyCount}; Added items: ${addCount}`,
      );
      logger.info("Upload of XML to Webshop successful");
    } else {
      logger.warn("Upload of XML to Webshop failed");
    }
    try {
      await fs.appendFile(
        config.logs.uploadLogWithoutExtension + getFormattedDateTime() + ".log",
        getFormattedDateTime() + "------------------------------------------\n",
        "utf-8",
      );
      await fs.appendFile(
        config.logs.uploadLogWithoutExtension + getFormattedDateTime() + ".log",
        responseForLink.data + "\n\n",
        "utf-8",
      );
    } catch (error) {
      logger.error("Error saving data:" + error);
    }
  }
}
