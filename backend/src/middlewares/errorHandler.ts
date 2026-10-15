import type { ErrorRequestHandler } from "express";
import HttpError from "../utils/HttpError.js";
import { env } from "../config/env.js";

const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next
) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  console.error("Unexpected API error:", error);

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Internal server error"
        : error instanceof Error
          ? error.message
          : "An unexpected error occurred",
  });
};

export default errorHandler;
