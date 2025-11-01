/**
 * Shared TypeScript types for API contracts
 * Used by both frontend and backend for type safety
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: number;
  email: string;
  username: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  password?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  createdAt: string;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  error: string;
  details?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// Pagination & Filtering
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortBy?: string;
}

export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export type QueryParams = PaginationParams & FilterParams;

// ============================================================================
// Generic CRUD Operations
// ============================================================================

export interface CreateOperation<T> {
  data: T;
}

export interface UpdateOperation<T> {
  id: number | string;
  data: Partial<T>;
}

export interface DeleteOperation {
  id: number | string;
}

export interface ListOperation {
  params?: QueryParams;
}

// ============================================================================
// WebSocket Events (optional)
// ============================================================================

export interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: string;
}

export interface WebSocketError {
  type: 'error';
  message: string;
  code?: string;
}

// ============================================================================
// File Upload
// ============================================================================

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface FileUploadRequest {
  file: File | Blob;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Health Check
// ============================================================================

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime?: number;
  services?: {
    database?: 'ok' | 'error';
    redis?: 'ok' | 'error';
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ApiError).error === 'string'
  );
}

export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response
  );
}

// ============================================================================
// Constants
// ============================================================================

export const API_ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  refresh: '/api/auth/refresh',
  me: '/api/auth/me',

  // Users
  users: '/api/users',
  user: (id: number | string) => `/api/users/${id}`,

  // Health
  health: '/health',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;
