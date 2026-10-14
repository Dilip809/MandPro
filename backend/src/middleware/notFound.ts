import type { RequestHandler } from "express";
import HttpError from "../utils/HttpError.js";

const notFound: RequestHandler = (req, _res, next) => {
  next(
    new HttpError(
      404,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
};

export default notFound;
