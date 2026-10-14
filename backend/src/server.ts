import app from "./app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(
        `Mandipro API running at http://localhost:${env.PORT}`
      );
    });

    const shutdown = (signal: string): void => {
      console.log(`${signal} received. Closing server...`);

      server.close(() => {
        void import("mongoose")
          .then(({ default: mongoose }) => mongoose.disconnect())
          .then(() => {
            console.log("Server and database connections closed");
            process.exit(0);
          })
          .catch((error: unknown) => {
            console.error("Shutdown failed:", error);
            process.exit(1);
          });
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start Mandipro API:", error);
    process.exit(1);
  }
};

void startServer();
