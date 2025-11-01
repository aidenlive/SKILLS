/**
 * Authentication Context for React
 *
 * Production-ready authentication context with:
 * - User state management
 * - Login/logout functionality
 * - Token management
 * - Protected routes
 * - Auth persistence
 * - Loading states
 *
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, ApiClientError } from './api-client';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * User type
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  emailVerified: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Auth context type
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  refetchUser: () => Promise<void>;
}

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Login response
 */
interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// ============================================================================
// Auth Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user && apiClient.isAuthenticated();

  /**
   * Fetch current user from API
   */
  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await apiClient.get<User>('/auth/me');
      setUser(userData);
    } catch (err) {
      // If token is invalid, clear it
      if (err instanceof ApiClientError && err.isAuthError()) {
        apiClient.clearTokens();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      // Check if we have a token
      if (apiClient.isAuthenticated()) {
        await fetchUser();
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<LoginResponse>('/auth/login', credentials, {
        skipAuth: true,
      });

      // Store tokens
      apiClient.setAccessToken(response.accessToken);
      if (response.refreshToken) {
        apiClient.setRefreshToken(response.refreshToken);
      }

      // Set user
      setUser(response.user);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<LoginResponse>('/auth/register', data, {
        skipAuth: true,
      });

      // Store tokens (if auto-login after registration)
      if (response.accessToken) {
        apiClient.setAccessToken(response.accessToken);
        if (response.refreshToken) {
          apiClient.setRefreshToken(response.refreshToken);
        }
        setUser(response.user);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setLoading(true);
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Logout locally even if API call fails
      console.error('Logout error:', err);
    } finally {
      apiClient.clearTokens();
      setUser(null);
      setLoading(false);
    }
  };

  /**
   * Update user locally (optimistic update)
   */
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Refetch user data
   */
  const refetchUser = async () => {
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    clearError,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Custom Hook
// ============================================================================

/**
 * Use auth context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// ============================================================================
// Protected Route Component
// ============================================================================

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRole?: string;
}

/**
 * Protected route wrapper
 * Redirects to login if not authenticated
 */
export function ProtectedRoute({
  children,
  fallback = null,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Save intended destination for redirect after login
    const currentPath = window.location.pathname;
    sessionStorage.setItem('redirectAfterLogin', currentPath);

    // Show fallback or redirect
    return fallback ? <>{fallback}</> : <div>Please log in to continue.</div>;
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    return <div>You do not have permission to access this page.</div>;
  }

  return <>{children}</>;
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: string): boolean {
  const { user } = useAuth();
  return user?.role === role;
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasAnyRole(roles: string[]): boolean {
  const { user } = useAuth();
  return !!user && roles.includes(user.role);
}

/**
 * Hook to get user permissions (example with role-based permissions)
 */
export function usePermissions() {
  const { user } = useAuth();

  const can = (permission: string): boolean => {
    if (!user) return false;

    const rolePermissions: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
      moderator: ['read', 'write', 'delete'],
      user: ['read', 'write'],
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  };

  return { can };
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: App setup with AuthProvider
 *
 * import { AuthProvider } from './auth-context';
 *
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router>
 *         <Routes>
 *           <Route path="/login" element={<LoginPage />} />
 *           <Route
 *             path="/dashboard"
 *             element={
 *               <ProtectedRoute>
 *                 <DashboardPage />
 *               </ProtectedRoute>
 *             }
 *           />
 *         </Routes>
 *       </Router>
 *     </AuthProvider>
 *   );
 * }
 */

/**
 * Example 2: Login form
 *
 * import { useAuth } from './auth-context';
 * import { useState } from 'react';
 *
 * function LoginForm() {
 *   const { login, loading, error } = useAuth();
 *   const [email, setEmail] = useState('');
 *   const [password, setPassword] = useState('');
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     try {
 *       await login({ email, password });
 *       // Redirect to dashboard or intended page
 *       const redirect = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
 *       sessionStorage.removeItem('redirectAfterLogin');
 *       window.location.href = redirect;
 *     } catch (err) {
 *       // Error is set in context
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error}</div>}
 *       <input
 *         type="email"
 *         value={email}
 *         onChange={(e) => setEmail(e.target.value)}
 *         placeholder="Email"
 *         required
 *       />
 *       <input
 *         type="password"
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *         placeholder="Password"
 *         required
 *       />
 *       <button type="submit" disabled={loading}>
 *         {loading ? 'Logging in...' : 'Log In'}
 *       </button>
 *     </form>
 *   );
 * }
 */

/**
 * Example 3: User profile component
 *
 * import { useAuth } from './auth-context';
 *
 * function UserProfile() {
 *   const { user, logout, loading } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return null;
 *
 *   return (
 *     <div>
 *       <h2>{user.name}</h2>
 *       <p>{user.email}</p>
 *       <p>Role: {user.role}</p>
 *       <button onClick={logout}>Log Out</button>
 *     </div>
 *   );
 * }
 */

/**
 * Example 4: Role-based rendering
 *
 * import { useAuth, useHasRole } from './auth-context';
 *
 * function AdminPanel() {
 *   const isAdmin = useHasRole('admin');
 *
 *   if (!isAdmin) {
 *     return <div>Access denied. Admin only.</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Admin Panel</h1>
 *       {/* Admin content */}
 *     </div>
 *   );
 * }
 */

/**
 * Example 5: Permission-based actions
 *
 * import { usePermissions } from './auth-context';
 *
 * function PostActions({ post }) {
 *   const { can } = usePermissions();
 *
 *   return (
 *     <div>
 *       {can('write') && <button>Edit</button>}
 *       {can('delete') && <button>Delete</button>}
 *       {can('manage_settings') && <button>Settings</button>}
 *     </div>
 *   );
 * }
 */

/**
 * Example 6: Protected route with role
 *
 * <Route
 *   path="/admin"
 *   element={
 *     <ProtectedRoute requiredRole="admin">
 *       <AdminPage />
 *     </ProtectedRoute>
 *   }
 * />
 */

/**
 * Example 7: Registration form
 *
 * function RegisterForm() {
 *   const { register, loading, error } = useAuth();
 *   const [formData, setFormData] = useState({
 *     email: '',
 *     username: '',
 *     password: '',
 *     firstName: '',
 *     lastName: '',
 *   });
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     try {
 *       await register(formData);
 *       // Redirect to dashboard or email verification page
 *     } catch (err) {
 *       // Error is set in context
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error}</div>}
 *       {/* Form fields */}
 *       <button type="submit" disabled={loading}>
 *         {loading ? 'Creating account...' : 'Sign Up'}
 *       </button>
 *     </form>
 *   );
 * }
 */

/**
 * Example 8: Auto-refetch user on profile update
 *
 * function ProfileEdit() {
 *   const { user, refetchUser, updateUser } = useAuth();
 *
 *   const handleSave = async (updates: Partial<User>) => {
 *     // Optimistic update
 *     updateUser(updates);
 *
 *     try {
 *       await apiClient.patch(`/users/${user!.id}`, updates);
 *       // Refetch to get server data
 *       await refetchUser();
 *     } catch (err) {
 *       // Revert optimistic update on error
 *       await refetchUser();
 *     }
 *   };
 *
 *   return <form>{/* Profile form */}</form>;
 * }
 */
