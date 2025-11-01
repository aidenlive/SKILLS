/**
 * Express Middleware Examples
 *
 * Production-ready middleware for Node.js REST APIs including:
 * - Authentication (JWT)
 * - Authorization (role-based, resource-based)
 * - Error handling
 * - Request logging
 * - Rate limiting
 * - CORS configuration
 * - Request ID tracking
 * - Response compression
 *
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { randomUUID } from 'crypto';
import pino from 'pino';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Extended Request with user and requestId
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
  requestId?: string;
}

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================================
// Logger Configuration
// ============================================================================

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'accessToken',
      'refreshToken',
    ],
    remove: true,
  },
});

// ============================================================================
// Request ID Middleware
// ============================================================================

/**
 * Add unique request ID to every request
 * Useful for tracing requests through logs
 */
export function requestId(req: AuthRequest, res: Response, next: NextFunction) {
  req.requestId = req.headers['x-request-id'] as string || randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

// ============================================================================
// Request Logging Middleware
// ============================================================================

/**
 * Log all incoming requests
 */
export function requestLogger(req: AuthRequest, res: Response, next: NextFunction) {
  const start = Date.now();

  // Log request
  logger.info({
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  }, 'Incoming request');

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info({
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    }, 'Request completed');
  });

  next();
}

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Verify JWT token from Authorization header
 * Throws 401 if token is missing or invalid
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return next(new AppError(401, 'Authentication required', true, {
      code: 'NO_TOKEN',
    }));
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new AppError(401, 'Invalid authorization format', true, {
      code: 'INVALID_FORMAT',
    }));
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    logger.debug({
      requestId: req.requestId,
      userId: req.user.userId,
    }, 'User authenticated');

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, 'Token expired', true, {
        code: 'TOKEN_EXPIRED',
      }));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError(401, 'Invalid token', true, {
        code: 'INVALID_TOKEN',
      }));
    }

    next(error);
  }
}

/**
 * Optional authentication middleware
 * Doesn't fail if no token provided, but validates if present
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');

  if (parts.length === 2 && parts[0] === 'Bearer') {
    const token = parts[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      // Silently fail for optional auth
      logger.debug({ error }, 'Optional auth failed');
    }
  }

  next();
}

// ============================================================================
// Authorization Middleware
// ============================================================================

/**
 * Authorize specific roles
 * Must be used after authenticate middleware
 */
export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required', true, {
        code: 'NO_AUTH',
      }));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn({
        requestId: req.requestId,
        userId: req.user.userId,
        role: req.user.role,
        allowedRoles,
        url: req.url,
      }, 'Authorization failed');

      return next(new AppError(403, 'Insufficient permissions', true, {
        code: 'FORBIDDEN',
      }));
    }

    next();
  };
}

/**
 * Verify user owns the resource
 * Checks if :userId param matches authenticated user
 */
export function authorizeOwnership(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError(401, 'Authentication required'));
  }

  const resourceUserId = req.params.userId || req.body.userId;

  if (!resourceUserId) {
    return next(new AppError(400, 'User ID not found in request'));
  }

  if (req.user.userId !== resourceUserId && req.user.role !== 'admin') {
    logger.warn({
      requestId: req.requestId,
      userId: req.user.userId,
      resourceUserId,
    }, 'Ownership authorization failed');

    return next(new AppError(403, 'You do not have permission to access this resource'));
  }

  next();
}

/**
 * Check if user is admin or owner
 */
export function authorizeAdminOrOwner(userIdField = 'userId') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    if (req.user.role === 'admin' || req.user.userId === resourceUserId) {
      return next();
    }

    return next(new AppError(403, 'Insufficient permissions'));
  };
}

// ============================================================================
// Error Handling Middleware
// ============================================================================

/**
 * Not found handler (404)
 * Should be placed after all routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new AppError(404, `Route ${req.method} ${req.url} not found`, true, {
    code: 'NOT_FOUND',
  }));
}

/**
 * Global error handler
 * Should be placed last in middleware chain
 */
export function errorHandler(
  err: Error | AppError,
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle known operational errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;

    // Log operational errors as warnings
    logger.warn({
      requestId: req.requestId,
      error: message,
      statusCode,
      details,
      url: req.url,
      userId: req.user?.userId,
    }, 'Operational error');
  } else {
    // Log unexpected errors
    logger.error({
      requestId: req.requestId,
      error: err.message,
      stack: err.stack,
      url: req.url,
      userId: req.user?.userId,
    }, 'Unexpected error');
  }

  // Don't expose stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    error: message,
    ...(details && { details }),
    ...(isDevelopment && { stack: err.stack }),
    requestId: req.requestId,
  });
}

/**
 * Async error wrapper
 * Catches async errors and passes to error handler
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ============================================================================
// Rate Limiting Middleware
// ============================================================================

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({
      ip: req.ip,
      url: req.url,
    }, 'Rate limit exceeded');

    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API key rate limiter (more generous)
 */
export const apiKeyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'API rate limit exceeded.',
});

/**
 * File upload rate limiter
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many uploads, please try again later.',
});

// ============================================================================
// CORS Configuration
// ============================================================================

/**
 * CORS middleware with environment-based configuration
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn({ origin }, 'CORS request blocked');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours
});

// ============================================================================
// Security Headers
// ============================================================================

/**
 * Security headers middleware using Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
});

// ============================================================================
// Compression Middleware
// ============================================================================

/**
 * Response compression middleware
 */
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Balance between speed and compression ratio
});

// ============================================================================
// Request Validation Helpers
// ============================================================================

/**
 * Validate request content type
 */
export function requireContentType(...allowedTypes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];

    if (!contentType) {
      return next(new AppError(400, 'Content-Type header is required'));
    }

    const isAllowed = allowedTypes.some((type) => contentType.includes(type));

    if (!isAllowed) {
      return next(new AppError(415, `Unsupported media type. Expected: ${allowedTypes.join(', ')}`));
    }

    next();
  };
}

/**
 * Require JSON content type
 */
export const requireJSON = requireContentType('application/json');

// ============================================================================
// Pagination Middleware
// ============================================================================

/**
 * Parse and validate pagination parameters
 */
export function parsePagination(req: AuthRequest, res: Response, next: NextFunction) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  (req as any).pagination = {
    page,
    limit,
    offset,
  };

  next();
}

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Add helper methods to response object
 */
export function responseHelpers(req: Request, res: Response, next: NextFunction) {
  // Success response
  (res as any).success = (data: any, message?: string) => {
    res.json({
      success: true,
      ...(message && { message }),
      data,
    });
  };

  // Paginated response
  (res as any).paginated = (data: any[], total: number, page: number, limit: number) => {
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  };

  // Error response
  (res as any).error = (statusCode: number, message: string, details?: any) => {
    res.status(statusCode).json({
      success: false,
      error: message,
      ...(details && { details }),
    });
  };

  next();
}

// ============================================================================
// API Version Middleware
// ============================================================================

/**
 * Check API version from header or URL
 */
export function apiVersion(supportedVersions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const versionHeader = req.headers['api-version'] as string;
    const versionUrl = req.path.match(/^\/v(\d+)\//)?.[1];

    const version = versionHeader || versionUrl || '1';

    if (!supportedVersions.includes(version)) {
      return next(new AppError(400, `API version ${version} is not supported`, true, {
        supportedVersions,
      }));
    }

    (req as any).apiVersion = version;
    next();
  };
}

// ============================================================================
// Maintenance Mode Middleware
// ============================================================================

/**
 * Return 503 when in maintenance mode
 */
export function maintenanceMode(req: Request, res: Response, next: NextFunction) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).json({
      error: 'Service temporarily unavailable for maintenance',
      message: process.env.MAINTENANCE_MESSAGE || 'We\'ll be back soon!',
    });
  }
  next();
}

// ============================================================================
// Usage Example
// ============================================================================

/**
 * Example Express app setup:
 *
 * import express from 'express';
 * import * as middleware from './middleware-examples';
 *
 * const app = express();
 *
 * // Security & basics
 * app.use(middleware.securityHeaders);
 * app.use(middleware.corsMiddleware);
 * app.use(middleware.compressionMiddleware);
 * app.use(express.json({ limit: '10mb' }));
 * app.use(express.urlencoded({ extended: true }));
 *
 * // Request tracking
 * app.use(middleware.requestId);
 * app.use(middleware.requestLogger);
 *
 * // Response helpers
 * app.use(middleware.responseHelpers);
 *
 * // Maintenance mode check
 * app.use(middleware.maintenanceMode);
 *
 * // Rate limiting
 * app.use('/api/', middleware.generalLimiter);
 * app.use('/api/auth/', middleware.authLimiter);
 *
 * // Public routes
 * app.post('/api/auth/login', authController.login);
 *
 * // Protected routes
 * app.get('/api/users',
 *   middleware.authenticate,
 *   middleware.parsePagination,
 *   userController.list
 * );
 *
 * // Admin routes
 * app.delete('/api/users/:id',
 *   middleware.authenticate,
 *   middleware.authorize('admin'),
 *   userController.delete
 * );
 *
 * // Owner or admin routes
 * app.put('/api/users/:userId/profile',
 *   middleware.authenticate,
 *   middleware.authorizeAdminOrOwner('userId'),
 *   userController.updateProfile
 * );
 *
 * // Error handlers (must be last)
 * app.use(middleware.notFoundHandler);
 * app.use(middleware.errorHandler);
 *
 * export default app;
 */
