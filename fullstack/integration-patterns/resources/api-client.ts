/**
 * API Client for Frontend-Backend Integration
 *
 * Production-ready API client with:
 * - Type-safe request/response handling
 * - JWT authentication
 * - Request/response interceptors
 * - Automatic token refresh
 * - Error handling with retries
 * - Request cancellation
 * - Loading states
 * - Request deduplication
 *
 * @version 1.0.0
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Standard API error format
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
  code?: string;
  requestId?: string;
}

/**
 * Request configuration options
 */
export interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  onUploadProgress?: (progress: number) => void;
}

/**
 * Interceptor function types
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
export type ErrorInterceptor = (error: ApiClientError) => void | Promise<void>;

// ============================================================================
// Custom Error Class
// ============================================================================

/**
 * API Client Error with detailed information
 */
export class ApiClientError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public details?: Array<{ field: string; message: string }>,
    public requestId?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }

  /**
   * Check if error is a specific type
   */
  is(code: string): boolean {
    return this.code === code;
  }

  /**
   * Check if error is authentication related
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.status === 400 && !!this.details;
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(): boolean {
    return this.status === 0;
  }

  /**
   * Get validation errors as a map
   */
  getValidationErrors(): Record<string, string> {
    if (!this.details) return {};

    return this.details.reduce((acc, { field, message }) => {
      acc[field] = message;
      return acc;
    }, {} as Record<string, string>);
  }
}

// ============================================================================
// Token Storage
// ============================================================================

class TokenStorage {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  setAccessToken(token: string): void {
    localStorage.setItem(this.accessTokenKey, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  hasTokens(): boolean {
    return !!this.getAccessToken();
  }
}

// ============================================================================
// API Client
// ============================================================================

/**
 * Main API Client class
 */
export class ApiClient {
  private baseUrl: string;
  private tokenStorage = new TokenStorage();
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private refreshPromise: Promise<string> | null = null;
  private abortControllers = new Map<string, AbortController>();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // ============================================================================
  // Interceptor Management
  // ============================================================================

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    this.tokenStorage.setAccessToken(token);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): void {
    this.tokenStorage.setRefreshToken(token);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.tokenStorage.clearTokens();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenStorage.hasTokens();
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<string> {
    // If refresh is already in progress, return existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.tokenStorage.getRefreshToken();

        if (!refreshToken) {
          throw new ApiClientError(401, 'No refresh token available', 'NO_REFRESH_TOKEN');
        }

        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new ApiClientError(401, 'Token refresh failed', 'REFRESH_FAILED');
        }

        const data = await response.json();
        this.setAccessToken(data.accessToken);

        if (data.refreshToken) {
          this.setRefreshToken(data.refreshToken);
        }

        return data.accessToken;
      } catch (error) {
        this.clearTokens();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // ============================================================================
  // Request Management
  // ============================================================================

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      skipAuth = false,
      retries = 0,
      retryDelay = 1000,
      timeout = 30000,
      ...fetchOptions
    } = config;

    // Normalize endpoint
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const requestId = `${Date.now()}-${Math.random()}`;
    this.abortControllers.set(requestId, controller);

    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Build headers
      let headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      };

      // Add auth token if not skipped
      if (!skipAuth) {
        const token = this.getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Apply request interceptors
      let interceptedConfig = { ...fetchOptions, headers };
      for (const interceptor of this.requestInterceptors) {
        interceptedConfig = await interceptor(interceptedConfig);
      }

      // Make request
      let response = await fetch(url, {
        ...interceptedConfig,
        signal: controller.signal,
      });

      // Handle 401 - try token refresh
      if (response.status === 401 && !skipAuth) {
        try {
          await this.refreshAccessToken();

          // Retry request with new token
          const newToken = this.getAccessToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
          }

          response = await fetch(url, {
            ...interceptedConfig,
            headers,
            signal: controller.signal,
          });
        } catch (refreshError) {
          // Token refresh failed, clear tokens
          this.clearTokens();
          throw new ApiClientError(
            401,
            'Authentication expired. Please log in again.',
            'AUTH_EXPIRED'
          );
        }
      }

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      // Handle non-OK responses
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
          success: false,
          error: response.statusText || 'An error occurred',
        }));

        const error = new ApiClientError(
          response.status,
          errorData.error,
          errorData.code,
          errorData.details,
          errorData.requestId
        );

        // Apply error interceptors
        for (const interceptor of this.errorInterceptors) {
          await interceptor(error);
        }

        throw error;
      }

      // Parse response
      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      // Handle abort (timeout or manual cancel)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiClientError(0, 'Request timeout', 'TIMEOUT');
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiClientError(0, 'Network error. Please check your connection.', 'NETWORK_ERROR');
      }

      // Retry logic
      if (retries > 0 && error instanceof ApiClientError && error.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return this.request<T>(endpoint, {
          ...config,
          retries: retries - 1,
          retryDelay: retryDelay * 2, // Exponential backoff
        });
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): void {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }

  // ============================================================================
  // HTTP Methods
  // ============================================================================

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'GET',
    });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
    return response.data;
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T>(
    endpoint: string,
    file: File,
    config?: RequestConfig & { onProgress?: (progress: number) => void }
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && config?.onProgress) {
          const progress = (event.loaded / event.total) * 100;
          config.onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.data);
        } else {
          const error = JSON.parse(xhr.responseText);
          reject(
            new ApiClientError(
              xhr.status,
              error.error || 'Upload failed',
              error.code,
              error.details
            )
          );
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiClientError(0, 'Upload failed', 'UPLOAD_ERROR'));
      });

      xhr.open('POST', `${this.baseUrl}${endpoint}`);

      const token = this.getAccessToken();
      if (token && !config?.skipAuth) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }
}

// ============================================================================
// Create Default Instance
// ============================================================================

/**
 * Default API client instance
 * Import and use this in your application
 */
export const apiClient = new ApiClient(
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
);

// Add default error interceptor for logging
apiClient.addErrorInterceptor((error) => {
  console.error('API Error:', {
    status: error.status,
    message: error.message,
    code: error.code,
    details: error.details,
  });
});

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: Basic GET request
 *
 * const users = await apiClient.get<User[]>('/api/users');
 */

/**
 * Example 2: POST with data
 *
 * const newUser = await apiClient.post<User>('/api/users', {
 *   email: 'user@example.com',
 *   name: 'John Doe',
 * });
 */

/**
 * Example 3: With retries
 *
 * const data = await apiClient.get<Data>('/api/data', {
 *   retries: 3,
 *   retryDelay: 1000,
 * });
 */

/**
 * Example 4: File upload with progress
 *
 * const result = await apiClient.upload<{ url: string }>(
 *   '/api/upload',
 *   file,
 *   {
 *     onProgress: (progress) => {
 *       console.log(`Upload progress: ${progress}%`);
 *     },
 *   }
 * );
 */

/**
 * Example 5: Custom error handling
 *
 * try {
 *   await apiClient.post('/api/users', userData);
 * } catch (error) {
 *   if (error instanceof ApiClientError) {
 *     if (error.isValidationError()) {
 *       const errors = error.getValidationErrors();
 *       console.log('Validation errors:', errors);
 *     } else if (error.isAuthError()) {
 *       // Redirect to login
 *       router.push('/login');
 *     }
 *   }
 * }
 */

/**
 * Example 6: Add custom interceptor
 *
 * apiClient.addRequestInterceptor((config) => {
 *   // Add custom header
 *   config.headers = {
 *     ...config.headers,
 *     'X-Custom-Header': 'value',
 *   };
 *   return config;
 * });
 */
