/**
 * Execution Route — @index0/sandbox-manager
 * Exposes POST /execute matching ISandboxRequest and returning IApiResponse<ISandboxExecutionResult>.
 */

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import type { IApiResponse, ISandboxExecutionResult } from "@index0/contracts";
import type { ExecutionService } from "../services/execution.service.js";
import { executeRequestSchema } from "../schemas/execution.schema.js";

export function createExecuteRouter(executionService: ExecutionService): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate payload against schema
      const validated = executeRequestSchema.parse(req.body);

      // Execute code in sandbox with guaranteed teardown
      const executionResult: ISandboxExecutionResult = await executionService.execute(validated);

      const response: IApiResponse<ISandboxExecutionResult> = {
        success: true,
        data: executionResult,
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
