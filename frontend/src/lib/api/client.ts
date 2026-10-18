
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (!config.baseURL) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_API_URL is not configured."),
    );
  }

  return config;
});

export default apiClient;
