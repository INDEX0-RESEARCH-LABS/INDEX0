/**
 * Request Validation Schemas — @index0/sandbox-manager
 * Validates incoming payloads against @index0/contracts/v1/sandbox
 */

import { z } from "zod";
import { SANDBOX_QUOTAS } from "@index0/contracts";

export const executeRequestSchema = z.object({
  id: z.string().min(1, "Request id must not be empty"),
  code: z.string(),
  language: z.enum(["python", "typescript", "bash"], {
    errorMap: () => ({
      message: "Language must be one of: python, typescript, bash"
    })
  }),
  timeoutMs: z
    .number()
    .int()
    .min(100, "timeoutMs must be at least 100ms")
    .max(
      SANDBOX_QUOTAS.maxTimeoutMs,
      `timeoutMs cannot exceed quota of ${SANDBOX_QUOTAS.maxTimeoutMs}ms`
    )
    .optional()
    .default(SANDBOX_QUOTAS.defaultTimeoutMs),
  environmentVariables: z.record(z.string()).optional(),
  cpuCount: z.number().int().positive().optional(),
  memoryMb: z.number().int().positive().optional()
});

export type ExecuteRequestBody = z.infer<typeof executeRequestSchema>;
