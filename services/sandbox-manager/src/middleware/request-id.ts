/**
 * Request ID Middleware — @index0/sandbox-manager
 * Extracts or generates X-Request-ID for distributed tracing.
 */

import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingId = req.headers["x-request-id"];
  const requestId = typeof existingId === "string" && existingId.length > 0 ? existingId : randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
}
