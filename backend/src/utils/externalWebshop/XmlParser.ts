import * as xml2js from "xml2js";
import { ProductsInterface } from "../../types/ProductsInterface";
import { PriceInterface, ProductFromPrices } from "../../types/PriceInterface";
import { WebshopXlsxProduct } from "../../types/WebshopXlsxProduct";
import { categoriesHash } from "../../index";
import fs from "fs/promises";
import logger from "../../logger";

export class XmlParser {
  static async readProductsXml(filePath: string): Promise<WebshopXlsxProduct[]> {
    const productsFull: WebshopXlsxProduct[] = [];
    try {
      logger.info("Reading products.xml file");
      const data = await fs.readFile(filePath, "utf-8");
      xml2js.parseString(data, (err: Error | null, result: ProductsInterface) => {
        if (err) {
          logger.error(err);
          return;
        }

        result.offer.products[0].product.forEach((element) => {
          let name = "";
          let shortDescription = "";

          if (element.description && element.description[0]?.name) {
            element.description[0].name.some((nameElement) => {
              if (nameElement.$["xml:lang"] === "hun") {
                name = nameElement._;
              }
            });
          }

          if (element.description && element.description[0]?.long_desc) {
            element.description[0].long_desc.some((shortDescriptionElement) => {
              if (shortDescriptionElement.$["xml:lang"] === "hun") {
                shortDescription = shortDescriptionElement._;
              }
            });
          }

          let imageURL = "";
          if (
            name !== undefined &&
            shortDescription !== undefined &&
            element.images &&
            element.images[0].large &&
            element.images[0].large[0].image
          ) {
            const imageURLs = element.images[0].large[0].image.map(
              (image) => image.$.url,
            );
            imageURL = imageURLs.join("|");
          }

          if (name && shortDescription && imageURL) {
            const sefUrl = (
              element.producer[0].$.name +
              "/" +
              element.$.id
            ).replace(/[& ]/g, "_");
            const category = categoriesHash[element.category[0].$.name]
              ? categoriesHash[element.category[0].$.name]
              : "TESZT";
            productsFull.push({
              product_id: element.$.id,
              articleNumber: "ABC-" + element.$.id,
              producer: element.producer[0].$.name,
              category: category,
              unit: "db",
              name: name,
              short_description: shortDescription,
              weight_full: Number.parseFloat(element.sizes[0].size[0].$.weight),
              weight_net: Number.parseFloat(
                element.sizes[0].size[0].$["iaiext:weight_net"],
              ),
              barcode: element.sizes[0].size[0].$["iaiext:code_external"],
              sef_url: sefUrl,
              image_link: imageURL,
              product_available: 0,
              explicit: category.toLowerCase().includes("erotika") ? 1 : 0,
            });
          }
        });
      });
    } catch (err) {
      logger.error(err);
    }
    logger.info("products.xml file read");
    return productsFull;
  }

  static async readPricesXml(
    filePath: string,
    productsFull: WebshopXlsxProduct[],
  ): Promise<WebshopXlsxProduct[]> {
    try {
      logger.info("Reading prices.xml file");
      const data = await fs.readFile(filePath, "utf-8");
      xml2js.parseString(data, (err: Error | null, result: PriceInterface) => {
        if (err) {
          logger.error(err);
          return;
        }
        const temp = result.offer.products[0].product;
        productsFull.forEach((product) => {
          const matchingProduct = temp.find(
            (tempProduct: ProductFromPrices) =>
              tempProduct.$.id === product.product_id,
          );
          if (matchingProduct) {
            if (matchingProduct.srp === undefined) {
              product.price_net = 0;
              product.price_br = 0;
              product.quantity = 0;
            } else {
              const priceBr = Math.round(
                Number.parseFloat(matchingProduct.srp[0].$.net) * 1.27,
              );
              product.price_net = Number.parseFloat(
                matchingProduct.srp[0].$.net,
              );
              product.price_br = priceBr;
              product.quantity = Number.parseInt(
                matchingProduct.sizes[0].size[0].stock[0].$.quantity,
              );
              if (product.category !== "TESZT") {
                product.product_available = 1;
              }
            }
          } else {
            product.price_net = 0;
            product.price_br = 0;
            product.quantity = 0;
          }
        });
      });
    } catch (err) {
      logger.error(err);
    }
    logger.info("prices.xml file read");
    return productsFull;
  }
}
