import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { sessionMiddleware } from "./config/session.js";
import sellerApplicationRoutes from "./routes/sellerApplicationRoutes.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);

app.get("/api/health", (_req, res) => {
  const databaseConnected =
    mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected
      ? "Mandipro API is healthy"
      : "Database connection is unavailable",
    database: databaseConnected ? "connected" : "disconnected",
  });
});


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/seller-applications", sellerApplicationRoutes);

// Unknown routes must reach the 404 middleware.
app.use(notFound);

// Error handler must be registered last.
app.use(errorHandler);

export default app;
