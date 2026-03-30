import { logAndGetUnknownError, throwError } from "./axiosErrorHelper";

import axios from "axios";
import qs from "query-string";

type ClientRequestConfig = {
  params?: Record<string, unknown>;
  paramsSerializer?: (params: Record<string, unknown>) => string;
};

const API_BASE_URL = process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "";

const instance = axios.create({
  baseURL: API_BASE_URL,
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

async function post<TData, TBody>(path: string, body?: TBody, config?: ClientRequestConfig): Promise<TData> {
  const { data } = await instance.post<TData>(path, body, config);
  return data;
}

async function deleteHttpMethod<TData>(path: string, config?: ClientRequestConfig): Promise<TData> {
  const { data } = await instance.delete<TData>(path, config);
  return data;
}

async function put<TData, TBody>(path: string, body?: TBody, config?: ClientRequestConfig): Promise<TData> {
  const { data } = await instance.put<TData>(path, body, config);
  return data;
}

async function patch<TData, TBody>(path: string, body?: TBody, config?: ClientRequestConfig): Promise<TData> {
  const { data } = await instance.patch<TData>(path, body, config);
  return data;
}

const apiClient = {
  get,
  post,
  delete: deleteHttpMethod,
  put,
  patch,
};
export default apiClient;
