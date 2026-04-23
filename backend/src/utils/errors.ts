import type { ApiError, ApiErrorCode } from "../types/contracts.js";

export class DomainError extends Error {
  public readonly payload: ApiError;

  public constructor(code: ApiErrorCode, message: string, details?: string) {
    super(message);
    this.payload = details ? { code, message, details } : { code, message };
  }
}

export const createValidationError = (message: string, details?: string): ApiError =>
  details
    ? {
        code: "VALIDATION_ERROR",
        message,
        details,
      }
    : {
        code: "VALIDATION_ERROR",
        message,
      };
