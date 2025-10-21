import express from "express";
import type { Application } from "express";
import { configureRoutes } from "./routes";
import { config } from "./config/environment";
import { logger } from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { configureMiddleware } from "./config/middleware";

const app: Application = express();

// Configure middleware
configureMiddleware(app);

// Configure routes
configureRoutes(app);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

const server = app.listen(config.PORT, () => {
  logger.info(`🚀 Server running on port ${config.PORT}`);
  logger.info(`📝 Environment: ${config.NODE_ENV}`);
  logger.info(`🔗 Health check: http://localhost:${config.PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

export default app;
