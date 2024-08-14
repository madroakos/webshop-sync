import axios, { InternalAxiosRequestConfig } from "axios";
import Webshop from "../Webshop/Webshop";
import logger from "../logger";

export async function authMiddleware(
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
  try {
    const token = await Webshop.getToken();
    if (token && token.data && new Date(token.expiration) > new Date()) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token.data}`;
    } else {
      logger.error("Invalid or expired token");
      await Promise.reject("Invalid or expired token");
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
}

export const axiosWithAuth = axios.create();

axiosWithAuth.interceptors.request.use(authMiddleware, (error) =>
  Promise.reject(error),
);
