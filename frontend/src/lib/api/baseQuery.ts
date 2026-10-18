
import type { AxiosRequestConfig } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import apiClient from "@/lib/api/client";
import axios from "axios";

interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: unknown;
}

interface AxiosBaseQueryError {
  status: number | "FETCH_ERROR";
  data: unknown;
}

export const axiosBaseQuery =
  (): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    AxiosBaseQueryError
  > =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const response = await apiClient({
        url,
        method,
        data,
        params,
      });

      return { data: response.data };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return {
          error: {
            status: error.response?.status ?? "FETCH_ERROR",
            data:
              error.response?.data ?? {
                message: error.message,
              },
          },
        };
      }

      return {
        error: {
          status: "FETCH_ERROR",
          data: {
            message: "An unexpected API error occurred",
          },
        },
      };
    }
  };
