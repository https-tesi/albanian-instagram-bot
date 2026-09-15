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

app.get("/privacy", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Privacy Policy - Albanian Instagram AI Bot</title>
  </head>
  <body>
    <main>
      <h1>Privacy Policy</h1>
      <p>
        Albanian Instagram AI Bot is an MVP/testing application that helps businesses reply to
        Instagram messages and prepare booking-related features.
      </p>
      <p>
        The app processes Instagram messages only to provide automated business replies and booking
        functionality.
      </p>
      <p>
        The app may process Instagram-scoped user IDs, message text, booking information, and basic
        conversation metadata.
      </p>
      <p>Data is not sold.</p>
      <p>Access tokens and secrets are not exposed publicly.</p>
      <p>
        Users can request deletion of their data by contacting:
        <a href="mailto:privacy@example.com">privacy@example.com</a>
      </p>
      <p>
        This page is for MVP/testing use and is not a legal guarantee. Replace the contact email and
        review this policy before production use.
      </p>
    </main>
  </body>
</html>`);
});

app.get("/data-deletion", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Data Deletion - Albanian Instagram AI Bot</title>
  </head>
  <body>
    <main>
      <h1>Data Deletion Request</h1>
      <p>
        You can request deletion of data related to your Instagram interaction with a business using
        this MVP/testing application.
      </p>
      <p>
        To request deletion, contact:
        <a href="mailto:privacy@example.com">privacy@example.com</a>
      </p>
      <p>
        Please provide enough information to identify your Instagram interaction, such as your
        Instagram username, the business you contacted, and the approximate date of the conversation.
      </p>
      <p>
        During the MVP phase, deletion requests are reviewed and processed manually.
      </p>
      <p>
        Replace the contact email before production use.
      </p>
    </main>
  </body>
</html>`);
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
