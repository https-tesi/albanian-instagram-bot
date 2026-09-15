import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

app.listen(env.port, () => {
  if (env.nodeEnv === "development") {
    logger.info(`Instagram chatbot backend is running on http://localhost:${env.port}`);
  } else {
    logger.info(`Instagram chatbot backend is running on port ${env.port}`);
  }
});
