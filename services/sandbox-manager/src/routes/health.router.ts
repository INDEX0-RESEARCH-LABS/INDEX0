/**
 * Health Route — @index0/sandbox-manager
 * Exposes GET /health returning ISandboxHealthResponse.
 */

import { Router } from "express";
import type { Request, Response } from "express";
import type { ExecutionService } from "../services/execution.service.js";

export function createHealthRouter(executionService: ExecutionService): Router {
  const router = Router();

  router.get("/", (_req: Request, res: Response) => {
    const health = executionService.getHealth();
    res.status(200).json(health);
  });

  return router;
}
