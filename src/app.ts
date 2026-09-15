import express, { ErrorRequestHandler } from "express";

import { apiRouter } from "./routes";
import { instagramRouter } from "./routes/instagram.routes";
import { logger } from "./utils/logger";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/api", apiRouter);
app.use("/webhook/instagram", instagramRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error("Unhandled application error", {
    message: error instanceof Error ? error.message : "Unknown error"
  });

  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error instanceof Error
          ? error.message
          : "Unknown error"
  });
};

app.use(errorHandler);
