// Axios instance for calling internal Next.js API routes (/api/...).
// Uses no baseURL so requests resolve relative to the current origin.
import { logAndGetUnknownError, throwError } from "./axiosErrorHelper";

import axios from "axios";
import qs from "query-string";

type ClientRequestConfig = {
  params?: Record<string, unknown>;
};

const instance = axios.create({
  paramsSerializer: qs.stringify,
});

instance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error)) {
      throwError(error);
    }
    throw logAndGetUnknownError(error);
  },
);

async function get<TData>(path: string, config?: ClientRequestConfig): Promise<TData> {
  const { data } = await instance.get<TData>(path, config);
  return data;
}

const internalClient = { get };
export default internalClient;
