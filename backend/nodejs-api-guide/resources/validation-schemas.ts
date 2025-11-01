/**
 * Zod Validation Schemas for Node.js REST APIs
 *
 * Production-ready validation schemas covering:
 * - User management (registration, login, profiles)
 * - Posts/Content (CRUD operations)
 * - Pagination and filtering
 * - File uploads
 * - Common data types (email, phone, URLs)
 *
 * @version 1.0.0
 */

import { z } from 'zod';

// ============================================================================
// Common Validation Helpers
// ============================================================================

/**
 * UUID v4 validation
 */
export const uuidSchema = z.string().uuid();

/**
 * ISO 8601 date string validation
 */
export const dateSchema = z.string().datetime();

/**
 * Email with comprehensive validation
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

/**
 * Strong password validation
 * - Min 8 characters
 * - At least one uppercase, lowercase, number, special char
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

/**
 * Username validation
 * - Alphanumeric + underscores/hyphens
 * - 3-30 characters
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .trim();

/**
 * URL validation
 */
export const urlSchema = z.string().url('Invalid URL format');

/**
 * Phone number validation (international format)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

/**
 * Slug validation (URL-friendly string)
 */
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
  .trim();

/**
 * Hex color validation
 */
export const colorSchema = z
  .string()
  .regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color')
  .optional();

// ============================================================================
// Pagination & Filtering
// ============================================================================

/**
 * Standard pagination schema
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Search/filter schema
 */
export const searchSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'archived']).optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
});

// ============================================================================
// User Schemas
// ============================================================================

/**
 * User registration schema
 */
export const userRegistrationSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and conditions' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * User login schema
 */
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * User profile update schema
 */
export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  bio: z.string().max(500).trim().optional(),
  avatar: urlSchema.optional(),
  phone: phoneSchema,
  location: z.string().max(100).optional(),
  website: urlSchema.optional(),
  socialLinks: z
    .object({
      twitter: urlSchema.optional(),
      github: urlSchema.optional(),
      linkedin: urlSchema.optional(),
    })
    .optional(),
});

/**
 * Password change schema
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset schema
 */
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Email verification schema
 */
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// ============================================================================
// Post/Article Schemas
// ============================================================================

/**
 * Post creation schema
 */
export const postCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: slugSchema.optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().max(500).optional(),
  coverImage: urlSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  categoryId: uuidSchema.optional(),
  publishedAt: dateSchema.optional(),
  metadata: z
    .object({
      readTime: z.number().int().positive().optional(),
      featured: z.boolean().optional(),
      allowComments: z.boolean().default(true),
    })
    .optional(),
});

/**
 * Post update schema
 */
export const postUpdateSchema = postCreateSchema.partial();

/**
 * Post query/filter schema
 */
export const postQuerySchema = paginationSchema.extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  tag: z.string().optional(),
  categoryId: uuidSchema.optional(),
  authorId: uuidSchema.optional(),
  search: z.string().min(1).max(200).optional(),
});

// ============================================================================
// Comment Schemas
// ============================================================================

/**
 * Comment creation schema
 */
export const commentCreateSchema = z.object({
  postId: uuidSchema,
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
  parentId: uuidSchema.optional(), // For nested comments
});

/**
 * Comment update schema
 */
export const commentUpdateSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
});

// ============================================================================
// Category Schemas
// ============================================================================

/**
 * Category creation schema
 */
export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(50),
  slug: slugSchema,
  description: z.string().max(200).optional(),
  parentId: uuidSchema.optional(),
  color: colorSchema,
});

/**
 * Category update schema
 */
export const categoryUpdateSchema = categoryCreateSchema.partial();

// ============================================================================
// File Upload Schemas
// ============================================================================

/**
 * File upload metadata schema
 */
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimetype: z
    .string()
    .refine(
      (mime) =>
        mime.startsWith('image/') ||
        mime.startsWith('video/') ||
        mime === 'application/pdf',
      'Unsupported file type'
    ),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024, 'File size must be less than 10MB'),
});

/**
 * Image upload schema with additional constraints
 */
export const imageUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif'], {
    errorMap: () => ({ message: 'Only JPEG, PNG, WebP, and GIF images are allowed' }),
  }),
  size: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024, 'Image size must be less than 5MB'),
  width: z.number().int().positive().max(4000).optional(),
  height: z.number().int().positive().max(4000).optional(),
});

// ============================================================================
// Settings/Configuration Schemas
// ============================================================================

/**
 * User settings schema
 */
export const userSettingsSchema = z.object({
  notifications: z
    .object({
      email: z.boolean().default(true),
      push: z.boolean().default(false),
      sms: z.boolean().default(false),
    })
    .optional(),
  privacy: z
    .object({
      profileVisibility: z.enum(['public', 'private', 'friends']).default('public'),
      showEmail: z.boolean().default(false),
      showPhone: z.boolean().default(false),
    })
    .optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'auto']).default('auto'),
      language: z.string().length(2).default('en'),
      timezone: z.string().default('UTC'),
    })
    .optional(),
});

// ============================================================================
// Admin/Moderation Schemas
// ============================================================================

/**
 * User role update schema
 */
export const userRoleUpdateSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']),
});

/**
 * Content moderation schema
 */
export const contentModerationSchema = z.object({
  action: z.enum(['approve', 'reject', 'flag', 'remove']),
  reason: z.string().min(1).max(500).optional(),
  note: z.string().max(1000).optional(),
});

/**
 * Ban user schema
 */
export const userBanSchema = z.object({
  userId: uuidSchema,
  reason: z.string().min(1).max(500),
  duration: z
    .enum(['1day', '7days', '30days', 'permanent'])
    .or(z.number().int().positive()),
  banType: z.enum(['temporary', 'permanent']).default('temporary'),
});

// ============================================================================
// API Key/Token Schemas
// ============================================================================

/**
 * API key creation schema
 */
export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  expiresAt: dateSchema.optional(),
  rateLimit: z.number().int().positive().optional(),
});

/**
 * Webhook creation schema
 */
export const webhookCreateSchema = z.object({
  url: urlSchema,
  events: z.array(z.string()).min(1, 'At least one event is required'),
  secret: z.string().min(16).optional(),
  active: z.boolean().default(true),
});

// ============================================================================
// Query Parameter Validation Helpers
// ============================================================================

/**
 * Validate and parse query parameters
 * Use with express query strings
 */
export function parseQueryParams<T extends z.ZodTypeAny>(
  schema: T,
  query: unknown
): z.infer<T> {
  return schema.parse(query);
}

/**
 * Boolean query parameter parser
 * Handles: true, false, "true", "false", 1, 0, "1", "0"
 */
export const booleanQueryParam = z
  .union([
    z.boolean(),
    z.enum(['true', 'false']),
    z.enum(['1', '0']),
    z.number(),
  ])
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    return val === 'true' || val === '1';
  });

/**
 * Array query parameter parser
 * Handles: "tag1,tag2,tag3" or ["tag1", "tag2", "tag3"]
 */
export const arrayQueryParam = z
  .union([z.string(), z.array(z.string())])
  .transform((val) => {
    if (Array.isArray(val)) return val;
    return val.split(',').map((item) => item.trim());
  });

// ============================================================================
// Validation Middleware Factory
// ============================================================================

/**
 * Create validation middleware for request body
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return async (req: any, res: any, next: any) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Create validation middleware for query parameters
 */
export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return async (req: any, res: any, next: any) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Create validation middleware for route parameters
 */
export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return async (req: any, res: any, next: any) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid route parameters',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: Validate request body
 *
 * import { Router } from 'express';
 * import { validateBody, userRegistrationSchema } from './validation-schemas';
 *
 * const router = Router();
 *
 * router.post('/register',
 *   validateBody(userRegistrationSchema),
 *   async (req, res) => {
 *     // req.body is now typed and validated
 *     const user = await createUser(req.body);
 *     res.status(201).json(user);
 *   }
 * );
 */

/**
 * Example 2: Validate query parameters
 *
 * router.get('/posts',
 *   validateQuery(postQuerySchema),
 *   async (req, res) => {
 *     // req.query is now typed and validated
 *     const posts = await getPosts(req.query);
 *     res.json(posts);
 *   }
 * );
 */

/**
 * Example 3: Validate route parameters
 *
 * const idParamSchema = z.object({
 *   id: uuidSchema,
 * });
 *
 * router.get('/users/:id',
 *   validateParams(idParamSchema),
 *   async (req, res) => {
 *     const user = await getUserById(req.params.id);
 *     res.json(user);
 *   }
 * );
 */

/**
 * Example 4: Custom validation with refinement
 *
 * const productSchema = z.object({
 *   name: z.string(),
 *   price: z.number().positive(),
 *   discountPrice: z.number().positive().optional(),
 * }).refine(
 *   (data) => !data.discountPrice || data.discountPrice < data.price,
 *   {
 *     message: 'Discount price must be less than regular price',
 *     path: ['discountPrice'],
 *   }
 * );
 */

/**
 * Example 5: Nested object validation
 *
 * const addressSchema = z.object({
 *   street: z.string(),
 *   city: z.string(),
 *   state: z.string().length(2),
 *   zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
 *   country: z.string().length(2),
 * });
 *
 * const orderSchema = z.object({
 *   items: z.array(z.object({
 *     productId: uuidSchema,
 *     quantity: z.number().int().positive(),
 *   })),
 *   shippingAddress: addressSchema,
 *   billingAddress: addressSchema.optional(),
 * });
 */
