import axios from "axios";
import { notify } from "./antd-notification";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1/";

export const http = axios.create({
  baseURL: API_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Có lỗi xảy ra";

    notify.error({
      message: "Lỗi hệ thống",
      description: message,
    });

    return Promise.reject(error);
  }
);