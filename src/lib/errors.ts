/**
 * Standardized API Error Handling
 *
 * Provides consistent error responses across all API routes.
 */

import { Context, NotFoundHandler, ErrorHandler } from "hono";
import { log } from "./logger";

// Error types
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string, id?: string) {
    super(
      404,
      "NOT_FOUND",
      id ? `${resource} with ID ${id} not found` : `${resource} not found`
    );
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: unknown) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends APIError {
  constructor(message = "Access denied") {
    super(403, "FORBIDDEN", message);
  }
}

export class ConflictError extends APIError {
  constructor(message: string, details?: unknown) {
    super(409, "CONFLICT", message, details);
  }
}

export class RateLimitError extends APIError {
  constructor(retryAfter?: number) {
    super(
      429,
      "RATE_LIMITED",
      "Too many requests. Please try again later.",
      retryAfter ? { retryAfter } : undefined
    );
  }
}

export class InternalError extends APIError {
  constructor(message = "An unexpected error occurred") {
    super(500, "INTERNAL_ERROR", message);
  }
}

// Standard API response format
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// Success response helper
export function successResponse<T>(data: T, meta?: Record<string, unknown>): APIResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

// Error response helper
export function errorResponse(error: APIError | Error): APIResponse {
  if (error instanceof APIError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Generic error - in Workers, we always hide internal error details
  return {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

// Hono error handler middleware
export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.get('requestId') as string | undefined;

  if (err instanceof APIError) {
    // Log known API errors at appropriate level
    if (err.statusCode >= 500) {
      log.error(err.message, err, { requestId, code: err.code });
    } else if (err.statusCode >= 400) {
      log.warn(err.message, { requestId, code: err.code, details: err.details });
    }
    return c.json(errorResponse(err), err.statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500);
  }

  // Log unexpected errors
  log.error('Unexpected error', err, {
    requestId,
    path: c.req.path,
    method: c.req.method,
  });

  return c.json(errorResponse(err), 500);
};

// Hono not found handler
export const notFoundHandler: NotFoundHandler = (c) => {
  const requestId = c.get('requestId') as string | undefined;

  log.info('Not found', {
    requestId,
    path: c.req.path,
    method: c.req.method,
  });

  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `${c.req.method} ${c.req.path} not found`,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  }, 404);
};

// Helper to wrap async route handlers with error handling
export function withErrorHandling<T extends Context>(
  handler: (c: T) => Promise<Response>
) {
  return async (c: T): Promise<Response> => {
    try {
      return await handler(c);
    } catch (error) {
      if (error instanceof APIError) {
        return c.json(errorResponse(error), error.statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500);
      }
      log.error("[Unhandled Error]", error as Error);
      return c.json(errorResponse(error as Error), 500);
    }
  };
}

// Validation helper
export function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === "") {
    throw new ValidationError(`${fieldName} is required`);
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
}

export function validateMinLength(value: string, minLength: number, fieldName: string): void {
  if (value.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`);
  }
}
