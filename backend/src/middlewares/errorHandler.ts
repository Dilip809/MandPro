
import type { ErrorRequestHandler } from "express";
import multer from "multer";
import HttpError from "../utils/HttpError.js";
import { env } from "../config/env.js";

const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next
) => {
  // Custom application errors
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Multer upload errors
  if (error instanceof multer.MulterError) {
    let message = "Image upload failed.";

    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = "Image size must not exceed 5MB.";
        break;

      case "LIMIT_FILE_COUNT":
      case "LIMIT_UNEXPECTED_FILE":
        message = "Only one product image is allowed.";
        break;

      case "LIMIT_PART_COUNT":
        message = "Too many form fields.";
        break;
    }

    res.status(400).json({
      success: false,
      message,
    });
    return;
  }

  // Unsupported image format or other upload errors
  if (
    error instanceof Error &&
    error.message === "Only JPG, PNG and WEBP images are allowed."
  ) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Unexpected errors
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
