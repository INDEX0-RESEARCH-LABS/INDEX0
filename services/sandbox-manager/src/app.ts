/**
 * Express Application Factory — @index0/sandbox-manager
 */

import express from "express";
import type { Express } from "express";
import cors from "cors";
import { ExecutionService } from "./services/execution.service.js";
import { createHealthRouter } from "./routes/health.router.js";
import { createExecuteRouter } from "./routes/execute.router.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { errorHandler } from "./middleware/error-handler.js";

export function createApp(executionService?: ExecutionService): Express {
  const app = express();
  const service = executionService || new ExecutionService();

  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware);

  // Mount API endpoints
  app.use("/health", createHealthRouter(service));
  app.use("/execute", createExecuteRouter(service));

  // Fallback 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        type: "https://index0.ai/errors/not-found",
        title: "Endpoint Not Found",
        status: 404,
        detail: "The requested route does not exist."
      }
    });
  });

  // Global RFC 7807 error handler
  app.use(errorHandler);

  return app;
}
