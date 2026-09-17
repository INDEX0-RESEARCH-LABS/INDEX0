/**
 * API Gateway & Service Envelope Contracts — @index0/contracts/v1/api
 * Authoritative schema definitions for API responses and RFC 7807 Problem Details.
 */

export interface IProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  invalidParams?: ReadonlyArray<{
    name: string;
    reason: string;
  }>;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: IProblemDetails;
  requestId: string;
  timestamp: string;
}

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";
