/**
 * RFC 7807 Error Handling Middleware — @index0/sandbox-manager
 * Maps errors to standard IProblemDetails and IApiResponse envelopes.
 */

import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import type { IApiResponse, IProblemDetails } from "@index0/contracts";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId || "unknown";
  const timestamp = new Date().toISOString();

  if (err instanceof ZodError) {
    const invalidParams = err.issues.map((issue) => ({
      name: issue.path.join("."),
      reason: issue.message
    }));

    const problem: IProblemDetails = {
      type: "https://index0.ai/errors/bad-request",
      title: "Validation Error",
      status: 400,
      detail: "The request body failed schema validation.",
      instance: req.originalUrl,
      invalidParams
    };

    const response: IApiResponse = {
      success: false,
      error: problem,
      requestId,
      timestamp
    };

    res.status(400).json(response);
    return;
  }

  const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
  const statusCode = typeof (err as { status?: number })?.status === "number"
    ? (err as { status?: number }).status!
    : 500;

  const problem: IProblemDetails = {
    type: "https://index0.ai/errors/internal-error",
    title: statusCode === 404 ? "Not Found" : "Internal Error",
    status: statusCode,
    detail: errorMessage,
    instance: req.originalUrl
  };

  const response: IApiResponse = {
    success: false,
    error: problem,
    requestId,
    timestamp
  };

  res.status(statusCode).json(response);
}
