/**
 * Authentication Patterns & Examples
 *
 * Production-ready authentication implementations including:
 * - JWT authentication with refresh tokens
 * - OAuth2 integration (Google, GitHub)
 * - Session-based authentication
 * - Password reset flow
 * - Email verification
 *
 * @version 1.0.0
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  BCRYPT_ROUNDS: 12,
  PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // 1 hour
  EMAIL_VERIFY_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
};

// ============================================================================
// Rate Limiters
// ============================================================================

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: 'Too many accounts created from this IP, please try again after an hour.',
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  message: 'Too many password reset requests, please try again later.',
});

// ============================================================================
// Password Utilities
// ============================================================================

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, CONFIG.BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// JWT Token Management
// ============================================================================

/**
 * Generate access token
 * @param {object} payload - Token payload (userId, email, role)
 * @returns {string} JWT access token
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, CONFIG.JWT_SECRET, {
    expiresIn: CONFIG.ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generate refresh token
 * @param {object} payload - Token payload (userId)
 * @returns {string} JWT refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET, {
    expiresIn: CONFIG.REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Verify access token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, CONFIG.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {object|null} Decoded payload or null if invalid
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, CONFIG.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Authenticate JWT token from Authorization header
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      code: 'NO_TOKEN',
    });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(403).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }

  req.user = decoded;
  next();
}

/**
 * Authorize user roles
 * @param {string[]} allowedRoles - Array of allowed roles
 */
export function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NO_AUTH',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

/**
 * Optional authentication (doesn't fail if no token)
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}

// ============================================================================
// Registration Flow
// ============================================================================

/**
 * Register a new user
 * POST /auth/register
 */
export async function register(req, res, db, emailService) {
  const { email, password, name } = req.body;

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      error: 'Password does not meet requirements',
      details: passwordValidation.errors,
    });
  }

  // Check if user exists
  const existingUser = await db.users.findByEmail(email);
  if (existingUser) {
    // Use generic message to prevent email enumeration
    return res.status(400).json({
      error: 'Registration failed',
    });
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await db.users.create({
    email,
    password: hashedPassword,
    name,
    emailVerified: false,
  });

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await db.verificationTokens.create({
    userId: user.id,
    token: verificationToken,
    expiresAt: new Date(Date.now() + CONFIG.EMAIL_VERIFY_EXPIRY),
  });

  // Send verification email
  await emailService.sendVerificationEmail(email, verificationToken);

  res.status(201).json({
    message: 'Registration successful. Please check your email to verify your account.',
    userId: user.id,
  });
}

// ============================================================================
// Login Flow
// ============================================================================

/**
 * Login with email and password
 * POST /auth/login
 */
export async function login(req, res, db, logger) {
  const { email, password } = req.body;

  // Find user
  const user = await db.users.findByEmail(email);

  if (!user) {
    // Perform dummy bcrypt to prevent timing attacks
    await bcrypt.compare(password, '$2b$12$dummyhashtopreventtimingattacks');
    logger.warn({ email, ip: req.ip }, 'Login attempt for non-existent user');
    return res.status(401).json({
      error: 'Invalid credentials',
    });
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingMinutes = Math.ceil((user.lockedUntil - new Date()) / 60000);
    return res.status(423).json({
      error: `Account locked. Try again in ${remainingMinutes} minutes.`,
      code: 'ACCOUNT_LOCKED',
    });
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    // Increment failed login attempts
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    const updates = { failedLoginAttempts: failedAttempts };

    // Lock account after 5 failed attempts
    if (failedAttempts >= 5) {
      updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      logger.warn({ userId: user.id, email }, 'Account locked due to failed login attempts');
    }

    await db.users.update(user.id, updates);

    logger.warn({ email, ip: req.ip, failedAttempts }, 'Failed login attempt');
    return res.status(401).json({
      error: 'Invalid credentials',
    });
  }

  // Check if email is verified
  if (!user.emailVerified) {
    return res.status(403).json({
      error: 'Please verify your email before logging in',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  // Reset failed login attempts
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await db.users.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // Store refresh token in database
  await db.refreshTokens.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info({ userId: user.id, email }, 'User logged in');

  res.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}

// ============================================================================
// Token Refresh Flow
// ============================================================================

/**
 * Refresh access token using refresh token
 * POST /auth/refresh
 */
export async function refreshAccessToken(req, res, db) {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      error: 'Refresh token required',
      code: 'NO_REFRESH_TOKEN',
    });
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return res.status(403).json({
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN',
    });
  }

  // Check if refresh token exists in database
  const storedToken = await db.refreshTokens.findByToken(refreshToken);

  if (!storedToken || storedToken.revoked) {
    return res.status(403).json({
      error: 'Refresh token not found or revoked',
      code: 'TOKEN_REVOKED',
    });
  }

  // Get user
  const user = await db.users.findById(decoded.userId);

  if (!user) {
    return res.status(403).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND',
    });
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({
    accessToken,
  });
}

// ============================================================================
// Logout Flow
// ============================================================================

/**
 * Logout user and revoke refresh token
 * POST /auth/logout
 */
export async function logout(req, res, db) {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (refreshToken) {
    // Revoke refresh token
    await db.refreshTokens.revoke(refreshToken);
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({
    message: 'Logged out successfully',
  });
}

// ============================================================================
// Email Verification Flow
// ============================================================================

/**
 * Verify email address
 * GET /auth/verify-email/:token
 */
export async function verifyEmail(req, res, db) {
  const { token } = req.params;

  // Find verification token
  const verification = await db.verificationTokens.findByToken(token);

  if (!verification) {
    return res.status(400).json({
      error: 'Invalid verification token',
      code: 'INVALID_TOKEN',
    });
  }

  // Check if token expired
  if (verification.expiresAt < new Date()) {
    return res.status(400).json({
      error: 'Verification token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Update user
  await db.users.update(verification.userId, {
    emailVerified: true,
  });

  // Delete verification token
  await db.verificationTokens.delete(verification.id);

  res.json({
    message: 'Email verified successfully',
  });
}

/**
 * Resend verification email
 * POST /auth/resend-verification
 */
export async function resendVerification(req, res, db, emailService) {
  const { email } = req.body;

  const user = await db.users.findByEmail(email);

  if (!user) {
    // Generic message to prevent email enumeration
    return res.json({
      message: 'If the email exists, a verification link has been sent.',
    });
  }

  if (user.emailVerified) {
    return res.status(400).json({
      error: 'Email already verified',
    });
  }

  // Delete old verification tokens
  await db.verificationTokens.deleteByUserId(user.id);

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await db.verificationTokens.create({
    userId: user.id,
    token: verificationToken,
    expiresAt: new Date(Date.now() + CONFIG.EMAIL_VERIFY_EXPIRY),
  });

  // Send verification email
  await emailService.sendVerificationEmail(email, verificationToken);

  res.json({
    message: 'If the email exists, a verification link has been sent.',
  });
}

// ============================================================================
// Password Reset Flow
// ============================================================================

/**
 * Request password reset
 * POST /auth/forgot-password
 */
export async function forgotPassword(req, res, db, emailService, logger) {
  const { email } = req.body;

  const user = await db.users.findByEmail(email);

  if (!user) {
    // Generic message to prevent email enumeration
    logger.info({ email, ip: req.ip }, 'Password reset requested for non-existent email');
    return res.json({
      message: 'If the email exists, a password reset link has been sent.',
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Store hashed token in database
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await db.passwordResets.create({
    userId: user.id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + CONFIG.PASSWORD_RESET_EXPIRY),
  });

  // Send reset email (send plain token, store hashed)
  await emailService.sendPasswordResetEmail(email, resetToken);

  logger.info({ userId: user.id, email }, 'Password reset requested');

  res.json({
    message: 'If the email exists, a password reset link has been sent.',
  });
}

/**
 * Reset password with token
 * POST /auth/reset-password
 */
export async function resetPassword(req, res, db, logger) {
  const { token, password } = req.body;

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      error: 'Password does not meet requirements',
      details: passwordValidation.errors,
    });
  }

  // Hash the token to match stored version
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find reset token
  const reset = await db.passwordResets.findByToken(hashedToken);

  if (!reset) {
    return res.status(400).json({
      error: 'Invalid or expired reset token',
      code: 'INVALID_TOKEN',
    });
  }

  // Check if token expired
  if (reset.expiresAt < new Date()) {
    await db.passwordResets.delete(reset.id);
    return res.status(400).json({
      error: 'Reset token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Hash new password
  const hashedPassword = await hashPassword(password);

  // Update user password
  await db.users.update(reset.userId, {
    password: hashedPassword,
    failedLoginAttempts: 0,
    lockedUntil: null,
  });

  // Delete reset token
  await db.passwordResets.delete(reset.id);

  // Revoke all refresh tokens for security
  await db.refreshTokens.revokeAllForUser(reset.userId);

  logger.info({ userId: reset.userId }, 'Password reset successful');

  res.json({
    message: 'Password reset successfully',
  });
}

// ============================================================================
// OAuth2 Integration Example (Google)
// ============================================================================

/**
 * Initiate Google OAuth2 flow
 * GET /auth/google
 */
export function googleAuth(req, res) {
  const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`${googleAuthUrl}?${params.toString()}`);
}

/**
 * Handle Google OAuth2 callback
 * GET /auth/google/callback
 */
export async function googleCallback(req, res, db, logger) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      error: 'Authorization code required',
    });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const googleUser = await userInfoResponse.json();

    // Find or create user
    let user = await db.users.findByEmail(googleUser.email);

    if (!user) {
      user = await db.users.create({
        email: googleUser.email,
        name: googleUser.name,
        emailVerified: true,
        provider: 'google',
        providerId: googleUser.id,
      });
    }

    // Generate our JWT tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
    });

    // Store refresh token
    await db.refreshTokens.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info({ userId: user.id, provider: 'google' }, 'OAuth login successful');

    // Redirect to frontend with access token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
  } catch (error) {
    logger.error({ error }, 'Google OAuth failed');
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
}

// ============================================================================
// Express Router Setup Example
// ============================================================================

/**
 * Example Express router setup
 *
 * import express from 'express';
 * import * as auth from './auth-examples.js';
 *
 * const router = express.Router();
 *
 * // Public routes
 * router.post('/register', auth.registerLimiter, (req, res) =>
 *   auth.register(req, res, db, emailService)
 * );
 * router.post('/login', auth.loginLimiter, (req, res) =>
 *   auth.login(req, res, db, logger)
 * );
 * router.post('/refresh', (req, res) =>
 *   auth.refreshAccessToken(req, res, db)
 * );
 * router.post('/logout', (req, res) =>
 *   auth.logout(req, res, db)
 * );
 * router.get('/verify-email/:token', (req, res) =>
 *   auth.verifyEmail(req, res, db)
 * );
 * router.post('/resend-verification', (req, res) =>
 *   auth.resendVerification(req, res, db, emailService)
 * );
 * router.post('/forgot-password', auth.passwordResetLimiter, (req, res) =>
 *   auth.forgotPassword(req, res, db, emailService, logger)
 * );
 * router.post('/reset-password', (req, res) =>
 *   auth.resetPassword(req, res, db, logger)
 * );
 *
 * // OAuth routes
 * router.get('/google', auth.googleAuth);
 * router.get('/google/callback', (req, res) =>
 *   auth.googleCallback(req, res, db, logger)
 * );
 *
 * // Protected routes
 * router.get('/me', auth.authenticateToken, async (req, res) => {
 *   const user = await db.users.findById(req.user.userId);
 *   res.json(user);
 * });
 *
 * // Admin only routes
 * router.get('/admin/users',
 *   auth.authenticateToken,
 *   auth.authorize(['admin']),
 *   async (req, res) => {
 *     const users = await db.users.findAll();
 *     res.json(users);
 *   }
 * );
 *
 * export default router;
 */
