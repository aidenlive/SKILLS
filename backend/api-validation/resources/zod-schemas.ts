/**
 * Comprehensive Zod Validation Schemas
 *
 * Production-ready validation schemas for Node.js/TypeScript APIs.
 * Type-safe, composable, and comprehensive error messages.
 *
 * Usage:
 *   npm install zod
 *   import { userSchema, validateBody } from './zod-schemas';
 */

import { z } from 'zod';

/**
 * ====================
 * COMMON HELPERS
 * ====================
 */

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Email with normalization
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .transform((email) => email.toLowerCase().trim());

// Strong password
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Username
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must not exceed 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .transform((username) => username.toLowerCase());

// URL
export const urlSchema = z.string().url('Invalid URL format');

// Phone number (international)
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)');

// Slug (URL-friendly)
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens');

// ISO date string
export const isoDateSchema = z.string().datetime('Invalid ISO date format');

// Date coercion
export const dateSchema = z.coerce.date();

/**
 * ====================
 * PAGINATION & FILTERING
 * ====================
 */

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['asc', 'desc']).default('asc'),
  sortBy: z.string().optional(),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const searchSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  tags: z.array(z.string()).or(z.string().transform((s) => [s])).optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type SearchParams = z.infer<typeof searchSchema>;

/**
 * ====================
 * USER MANAGEMENT
 * ====================
 */

export const userRegistrationSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    birthDate: z.coerce.date().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type UserRegistration = z.infer<typeof userRegistrationSchema>;

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export type UserLogin = z.infer<typeof userLoginSchema>;

export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  website: urlSchema.optional(),
  location: z.string().max(100).optional(),
  avatar: urlSchema.optional(),
});

export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type PasswordChange = z.infer<typeof passwordChangeSchema>;

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

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

export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

/**
 * ====================
 * CONTENT MANAGEMENT
 * ====================
 */

export const postCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: slugSchema.optional(),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  coverImage: urlSchema.optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10),
  categoryId: uuidSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: isoDateSchema.optional(),
});

export type PostCreate = z.infer<typeof postCreateSchema>;

export const postUpdateSchema = postCreateSchema.partial();

export type PostUpdate = z.infer<typeof postUpdateSchema>;

export const postQuerySchema = z.object({
  ...paginationSchema.shape,
  ...searchSchema.shape,
  authorId: uuidSchema.optional(),
});

export type PostQuery = z.infer<typeof postQuerySchema>;

export const commentCreateSchema = z.object({
  postId: uuidSchema,
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
  parentId: uuidSchema.optional(),
});

export type CommentCreate = z.infer<typeof commentCreateSchema>;

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: slugSchema,
  description: z.string().max(500).optional(),
  parentId: uuidSchema.optional(),
});

export type CategoryCreate = z.infer<typeof categoryCreateSchema>;

/**
 * ====================
 * FILE UPLOADS
 * ====================
 */

export const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, 'Invalid MIME type'),
  size: z.number().int().positive().max(50 * 1024 * 1024), // 50MB max
});

export type FileUpload = z.infer<typeof fileUploadSchema>;

export const imageUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  size: z.number().int().positive().max(10 * 1024 * 1024), // 10MB max
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type ImageUpload = z.infer<typeof imageUploadSchema>;

/**
 * ====================
 * SETTINGS & PREFERENCES
 * ====================
 */

export const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  language: z.string().length(2).default('en'),
  timezone: z.string().default('UTC'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    sms: z.boolean().default(false),
  }),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']).default('public'),
    showEmail: z.boolean().default(false),
    showOnline: z.boolean().default(true),
  }),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100),
  expiresAt: isoDateSchema.optional(),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
});

export type ApiKeyCreate = z.infer<typeof apiKeyCreateSchema>;

export const webhookCreateSchema = z.object({
  url: urlSchema,
  events: z.array(z.string()).min(1, 'At least one event is required'),
  secret: z.string().min(16).optional(),
  active: z.boolean().default(true),
});

export type WebhookCreate = z.infer<typeof webhookCreateSchema>;

/**
 * ====================
 * ADMIN & MODERATION
 * ====================
 */

export const userRoleUpdateSchema = z.object({
  userId: uuidSchema,
  role: z.enum(['user', 'moderator', 'admin']),
});

export type UserRoleUpdate = z.infer<typeof userRoleUpdateSchema>;

export const contentModerationSchema = z.object({
  contentId: uuidSchema,
  action: z.enum(['approve', 'reject', 'flag', 'remove']),
  reason: z.string().max(500).optional(),
  notifyAuthor: z.boolean().default(true),
});

export type ContentModeration = z.infer<typeof contentModerationSchema>;

export const userBanSchema = z.object({
  userId: uuidSchema,
  reason: z.string().min(1).max(500),
  expiresAt: isoDateSchema.optional(),
  permanent: z.boolean().default(false),
});

export type UserBan = z.infer<typeof userBanSchema>;

/**
 * ====================
 * CUSTOM VALIDATION HELPERS
 * ====================
 */

// Conditional required field
export function conditionalRequired<T extends z.ZodTypeAny>(
  schema: T,
  condition: (data: any) => boolean
) {
  return z.any().superRefine((data, ctx) => {
    if (condition(data)) {
      const result = schema.safeParse(data);
      if (!result.success) {
        result.error.errors.forEach((error) => {
          ctx.addIssue(error);
        });
      }
    }
  });
}

// Sanitize HTML
export const sanitizedHtmlSchema = z
  .string()
  .transform((html) => {
    // Basic HTML sanitization (use a library like DOMPurify in production)
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  });

// Trim strings
export const trimmedString = (min?: number, max?: number) => {
  let schema = z.string().transform((s) => s.trim());
  if (min !== undefined) schema = schema.min(min) as any;
  if (max !== undefined) schema = schema.max(max) as any;
  return schema;
};

// Non-empty array
export const nonEmptyArray = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.array(itemSchema).min(1, 'Array cannot be empty');

// Positive number
export const positiveNumber = (max?: number) => {
  let schema = z.number().positive();
  if (max !== undefined) schema = schema.max(max);
  return schema;
};

/**
 * ====================
 * EXPORT TYPE UTILITIES
 * ====================
 */

// Extract types from schemas
export type InferSchema<T extends z.ZodTypeAny> = z.infer<T>;

// Create optional version of schema
export function makeOptional<T extends z.ZodObject<any>>(schema: T) {
  return schema.partial();
}

// Create pick version of schema
export function pick<T extends z.ZodObject<any>, K extends keyof T['shape']>(
  schema: T,
  keys: K[]
) {
  return schema.pick(
    keys.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<K, true>)
  );
}

// Create omit version of schema
export function omit<T extends z.ZodObject<any>, K extends keyof T['shape']>(
  schema: T,
  keys: K[]
) {
  return schema.omit(
    keys.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<K, true>)
  );
}
