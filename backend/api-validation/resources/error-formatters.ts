/**
 * API Validation Error Formatters
 *
 * Standardized error formatting for Zod and Pydantic validation errors.
 * Provides consistent, user-friendly error messages across all endpoints.
 *
 * Usage:
 *   import { formatZodError, validateRequest } from './error-formatters';
 */

import { z, ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';

/**
 * ====================
 * ERROR TYPES
 * ====================
 */

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
  received?: any;
}

export interface ValidationErrorResponse {
  error: string;
  details: ValidationErrorDetail[];
  timestamp: string;
  path?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponseBase {
  success: false;
  error: string;
  message?: string;
  timestamp: string;
}

/**
 * ====================
 * ZOD ERROR FORMATTERS
 * ====================
 */

/**
 * Format Zod validation error to structured response
 */
export function formatZodError(error: ZodError, path?: string): ValidationErrorResponse {
  const details: ValidationErrorDetail[] = error.errors.map((err) => ({
    field: err.path.join('.') || 'root',
    message: err.message,
    code: err.code,
    received: err.code === 'invalid_type' ? (err as any).received : undefined,
  }));

  return {
    error: 'Validation failed',
    details,
    timestamp: new Date().toISOString(),
    path,
  };
}

/**
 * Format single field error
 */
export function formatFieldError(field: string, message: string): ValidationErrorResponse {
  return {
    error: 'Validation failed',
    details: [{ field, message }],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create custom validation error
 */
export function createValidationError(
  message: string,
  details?: ValidationErrorDetail[]
): ValidationErrorResponse {
  return {
    error: message,
    details: details || [],
    timestamp: new Date().toISOString(),
  };
}

/**
 * ====================
 * EXPRESS MIDDLEWARE
 * ====================
 */

/**
 * Validate request body against schema
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatZodError(error, req.path);
        res.status(400).json(formattedError);
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate query parameters against schema
 */
export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatZodError(error, req.path);
        res.status(400).json(formattedError);
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate route parameters against schema
 */
export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatZodError(error, req.path);
        res.status(400).json(formattedError);
      } else {
        next(error);
      }
    }
  };
}

/**
 * ====================
 * VALIDATION HELPERS
 * ====================
 */

/**
 * Validate and return result or throw formatted error
 */
export function validateOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(formatZodError(error));
    }
    throw error;
  }
}

/**
 * Safe validation (returns result object)
 */
export function validateSafe<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: ValidationErrorResponse } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: formatZodError(error) };
    }
    throw error;
  }
}

/**
 * ====================
 * CUSTOM ERROR CLASSES
 * ====================
 */

export class ValidationError extends Error {
  public statusCode: number = 400;
  public details: ValidationErrorResponse;

  constructor(details: ValidationErrorResponse) {
    super(details.error);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

/**
 * ====================
 * ERROR HANDLER MIDDLEWARE
 * ====================
 */

/**
 * Global error handler for Express
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log error
  console.error('[Error]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Validation error
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err.details);
  }

  // Zod error (not caught by middleware)
  if (err instanceof ZodError) {
    const formattedError = formatZodError(err, req.path);
    return res.status(400).json(formattedError);
  }

  // API error
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * ====================
 * RESPONSE HELPERS
 * ====================
 */

/**
 * Send success response
 */
export function sendSuccess<T = any>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
) {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message,
  };

  res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400,
  details?: ValidationErrorDetail[]
) {
  const response = details
    ? createValidationError(error, details)
    : {
        success: false,
        error,
        timestamp: new Date().toISOString(),
      };

  res.status(statusCode).json(response);
}

/**
 * Send paginated response
 */
export function sendPaginated<T = any>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  res.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}

/**
 * ====================
 * VALIDATION UTILITIES
 * ====================
 */

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Check if error is a Zod error
 */
export function isZodError(error: any): error is ZodError {
  return error instanceof ZodError;
}

/**
 * Extract first error message
 */
export function getFirstErrorMessage(error: ZodError): string {
  return error.errors[0]?.message || 'Validation failed';
}

/**
 * Group errors by field
 */
export function groupErrorsByField(error: ZodError): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const field = err.path.join('.') || 'root';
    if (!grouped[field]) {
      grouped[field] = [];
    }
    grouped[field].push(err.message);
  });

  return grouped;
}

/**
 * ====================
 * SANITIZATION HELPERS
 * ====================
 */

/**
 * Sanitize error for client response (remove sensitive info)
 */
export function sanitizeError(error: any): ErrorResponseBase {
  return {
    success: false,
    error: error.message || 'An error occurred',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sanitize validation error (keep only safe fields)
 */
export function sanitizeValidationError(error: ValidationErrorResponse): ValidationErrorResponse {
  return {
    error: error.error,
    details: error.details.map((detail) => ({
      field: detail.field,
      message: detail.message,
    })),
    timestamp: error.timestamp,
  };
}

/**
 * ====================
 * EXAMPLE USAGE
 * ====================
 */

/*
// Express route with validation middleware
import { validateBody, sendSuccess, sendError } from './error-formatters';
import { userSchema } from './zod-schemas';

router.post('/users',
  validateBody(userSchema),
  async (req, res, next) => {
    try {
      const user = await userService.create(req.body);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }
);

// Manual validation
import { validateSafe } from './error-formatters';

const result = validateSafe(userSchema, req.body);
if (!result.success) {
  return res.status(400).json(result.error);
}

const user = result.data;

// Error handler
import { errorHandler } from './error-formatters';

app.use(errorHandler);

// Custom validation error
import { ValidationError, createValidationError } from './error-formatters';

if (await userExists(email)) {
  throw new ValidationError(
    createValidationError('User already exists', [
      { field: 'email', message: 'Email is already registered' }
    ])
  );
}
*/
