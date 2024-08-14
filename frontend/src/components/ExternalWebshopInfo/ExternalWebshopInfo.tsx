import axios from "axios";
import { useEffect, useState } from "react";
import { Duration } from "luxon";
import React from "react";
import { DownloadIcon } from "../../icons/DownloadIcon.tsx";
import "./ExternalWebshopInfo.css";
import GreenCircle from "../../icons/GreenCircle.tsx";
import RedCircle from "../../icons/RedCircle.tsx";
import { config } from "../../config.ts";

interface LastExecutions {
  productsXml: {
    date: string;
    successful: string;
  };
  pricesXml: {
    date: string;
    successful: string;
  };
}

export function ExternalWebshopInfo() {
  const [executions, setExecutions] = useState<LastExecutions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextProducts, setNextProducts] = useState("");
  const [nextPrices, setNextPrices] = useState("");

  useEffect(() => {
    async function fetchExecutions() {
      const data = await getExecutions();
      setExecutions(data.data);
    }
    fetchExecutions().then(() => setIsLoading(false));
    getNextExecutions();
  }, []);

  return (
    <div id="externalwebshop" className="card">
      <h3>External Webshop xml files:</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          <li>
            <div className="flex cardInfo">
              {executions.productsXml.successful === "true" ? (
                <GreenCircle />
              ) : (
                <RedCircle />
              )}
              <p>
                <strong>Products:</strong>
              </p>
              <a
                href={config.fetchUrls.getProductsXml}
                download
                target={"_blank"}
                rel="noreferrer"
              >
                <DownloadIcon />
              </a>
            </div>
            <div className="flex cardInfo">
              <p>Last fetch at:&nbsp;</p>
              {executions.productsXml.date === "never" ? (
                <p>
                  <strong>{executions.productsXml.date}</strong>
                </p>
              ) : (
                <p>
                  <strong>
                    {new Date(executions.productsXml.date).toLocaleDateString() +
                      " " +
                      new Date(executions.productsXml.date).toLocaleTimeString()}
                  </strong>
                </p>
              )}
            </div>
            <div className="flex cardInfo">
              <p>Next fetch in:&nbsp;</p>
              {Number(nextProducts) > 60 ? (
                <p>
                  <strong>{Math.round(Number(nextProducts) / 60)} hours</strong>
                </p>
              ) : (
                <p>
                  <strong>{nextProducts} minutes</strong>
                </p>
              )}
            </div>
          </li>
          <li>
            <div className="flex cardInfo">
              {executions.pricesXml.successful === "true" ? (
                <GreenCircle />
              ) : (
                <RedCircle />
              )}
              <p>
                <strong>Prices:</strong>
              </p>
              <a
                href={config.fetchUrls.getPricesXml}
                download
                target={"_blank"}
                rel="noreferrer"
              >
                <DownloadIcon />
              </a>
            </div>
            <div className="flex cardInfo">
              <p>Last fetch at:&nbsp;</p>
              {executions.pricesXml.date === "never" ? (
                <p>
                  <strong>{executions.pricesXml.date}</strong>
                </p>
              ) : (
                <p>
                  <strong>
                    {new Date(executions.pricesXml.date).toLocaleDateString() +
                      " " +
                      new Date(executions.pricesXml.date).toLocaleTimeString()}
                  </strong>
                </p>
              )}
            </div>
            <div className="flex cardInfo">
              <p>Next fetch in:&nbsp;</p>
              {Number(nextPrices) > 60 ? (
                <p>
                  <strong>{Math.round(Number(nextPrices) / 60)} hours</strong>
                </p>
              ) : (
                <p>
                  <strong>{nextPrices} minutes</strong>
                </p>
              )}
            </div>
          </li>
        </ul>
      )}
    </div>
  );

  async function getExecutions() {
    try {
      return await axios.get(config.fetchUrls.getLastExecutions);
    } catch (error) {
      console.error("Error fetching last executions:", error);
    }
  }

  async function getNextExecutions() {
    try {
      const products = await axios.get(config.fetchUrls.getNextProductsExecution);
      setNextProducts(
        Math.round(
          Duration.fromISO(products.data.nextProducts).as("minutes"),
        ).toString(),
      );
      const prices = await axios.get(config.fetchUrls.getNextPricesExecution);
      setNextPrices(
        Math.round(
          Duration.fromISO(prices.data.nextPrices).as("minutes"),
        ).toString(),
      );
    } catch (error) {
      console.error("Error fetching next executions:", error);
    }
  }
}
