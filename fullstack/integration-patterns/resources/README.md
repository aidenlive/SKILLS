# Integration Patterns Resources

Production-ready patterns for frontend-backend integration with type safety, error handling, and authentication.

---

## Contents

1. **api-client.ts** - Type-safe API client with error handling
2. **auth-context.tsx** - React authentication context and hooks
3. **README.md** - This file

---

## Quick Start

### 1. Install Dependencies

```bash
# For React + TypeScript projects
npm install react react-dom

# Dev dependencies
npm install -D @types/react @types/react-dom typescript vite
```

### 2. Environment Configuration

```bash
# .env.local (frontend)
VITE_API_URL=http://localhost:3000
```

### 3. Copy Resource Files

```bash
# Copy to your project
cp api-client.ts src/lib/
cp auth-context.tsx src/contexts/
```

---

## File Details

### api-client.ts

**Lines:** ~650
**Type:** TypeScript
**Framework:** Agnostic (works with any framework)

**Features:**
- ✅ Type-safe requests and responses
- ✅ JWT authentication with automatic refresh
- ✅ Request/response interceptors
- ✅ Automatic retry with exponential backoff
- ✅ Request timeout handling
- ✅ Request cancellation
- ✅ File upload with progress tracking
- ✅ Error handling with detailed error types
- ✅ Token storage management

**Main Classes:**

#### ApiClient
The main API client class with HTTP methods:
- `get<T>(endpoint, config?)` - GET request
- `post<T>(endpoint, data?, config?)` - POST request
- `put<T>(endpoint, data?, config?)` - PUT request
- `patch<T>(endpoint, data?, config?)` - PATCH request
- `delete<T>(endpoint, config?)` - DELETE request
- `upload<T>(endpoint, file, config?)` - File upload

**Configuration Options:**
```typescript
interface RequestConfig {
  skipAuth?: boolean;        // Skip authentication header
  retries?: number;          // Number of retry attempts
  retryDelay?: number;       // Delay between retries (ms)
  timeout?: number;          // Request timeout (ms)
  headers?: HeadersInit;     // Custom headers
}
```

#### ApiClientError
Custom error class with helper methods:
- `is(code)` - Check error code
- `isAuthError()` - Check if 401/403
- `isValidationError()` - Check if validation error
- `isNetworkError()` - Check if network error
- `getValidationErrors()` - Get validation errors as object

#### TokenStorage
Manages JWT tokens in localStorage:
- `setAccessToken(token)` - Store access token
- `getAccessToken()` - Retrieve access token
- `setRefreshToken(token)` - Store refresh token
- `getRefreshToken()` - Retrieve refresh token
- `clearTokens()` - Clear all tokens
- `hasTokens()` - Check if tokens exist

---

### auth-context.tsx

**Lines:** ~550
**Type:** TypeScript + React
**Framework:** React 18+

**Features:**
- ✅ User state management
- ✅ Login/logout/register flows
- ✅ JWT token management
- ✅ Auto token refresh
- ✅ Protected routes
- ✅ Role-based access control
- ✅ Permission checking
- ✅ Loading states
- ✅ Error handling

**Components:**

#### AuthProvider
Root component that provides authentication context:
```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

#### ProtectedRoute
Wrapper for routes that require authentication:
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminPage />
</ProtectedRoute>
```

**Hooks:**

#### useAuth()
Main authentication hook:
```typescript
const {
  user,              // Current user or null
  loading,           // Loading state
  error,             // Error message
  isAuthenticated,   // Boolean
  login,             // Login function
  register,          // Register function
  logout,            // Logout function
  updateUser,        // Update user locally
  clearError,        // Clear error
  refetchUser,       // Refetch user data
} = useAuth();
```

#### useHasRole(role)
Check if user has specific role:
```typescript
const isAdmin = useHasRole('admin');
```

#### useHasAnyRole(roles)
Check if user has any of the specified roles:
```typescript
const canModerate = useHasAnyRole(['admin', 'moderator']);
```

#### usePermissions()
Permission-based access control:
```typescript
const { can } = usePermissions();
if (can('delete')) {
  // Show delete button
}
```

---

## Usage Guide

### Setup 1: Initialize API Client

```typescript
// src/lib/api-client.ts
import { ApiClient } from './api-client';

export const apiClient = new ApiClient(
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
);

// Add logging interceptor
apiClient.addErrorInterceptor((error) => {
  console.error('API Error:', error);
});

// Add custom header interceptor
apiClient.addRequestInterceptor((config) => {
  config.headers = {
    ...config.headers,
    'X-App-Version': '1.0.0',
  };
  return config;
});
```

### Setup 2: Wrap App with AuthProvider

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/auth-context';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### Example 1: Login Form

```tsx
// src/pages/Login.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });

      // Redirect to intended page or dashboard
      const redirect = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirect);
    } catch (err) {
      // Error is displayed via context
    }
  };

  return (
    <div className="login-page">
      <h1>Log In</h1>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}
```

### Example 2: Protected Dashboard

```tsx
// src/pages/Dashboard.tsx
import { useAuth } from '../contexts/auth-context';
import { ProtectedRoute } from '../contexts/auth-context';

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}

export function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### Example 3: Data Fetching with API Client

```tsx
// src/pages/Users.tsx
import { useState, useEffect } from 'react';
import { apiClient, ApiClientError } from '../lib/api-client';

interface User {
  id: string;
  name: string;
  email: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<User[]>('/api/users');
      setUsers(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example 4: Custom Data Hook

```tsx
// src/hooks/useQuery.ts
import { useState, useEffect } from 'react';
import { apiClient, ApiClientError } from '../lib/api-client';

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useQuery<T>(endpoint: string): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.get<T>(endpoint);
      setData(result);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
}

// Usage
function UserList() {
  const { data: users, loading, error, refetch } = useQuery<User[]>('/api/users');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {users?.map((user) => <div key={user.id}>{user.name}</div>)}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Example 5: File Upload with Progress

```tsx
// src/components/FileUpload.tsx
import { useState } from 'react';
import { apiClient } from '../lib/api-client';

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const result = await apiClient.upload<{ url: string }>(
        '/api/upload',
        file,
        {
          onProgress: (percent) => {
            setProgress(percent);
          },
        }
      );

      console.log('Upload successful:', result.url);
      alert('File uploaded successfully!');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {uploading && (
        <div>
          <progress value={progress} max={100} />
          <span>{Math.round(progress)}%</span>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### Example 6: Role-Based UI

```tsx
// src/components/AdminPanel.tsx
import { useAuth, useHasRole, usePermissions } from '../contexts/auth-context';

export function AdminPanel() {
  const { user } = useAuth();
  const isAdmin = useHasRole('admin');
  const { can } = usePermissions();

  if (!isAdmin) {
    return <div>Access denied. Admin only.</div>;
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      {can('manage_users') && (
        <section>
          <h2>User Management</h2>
          {/* User management UI */}
        </section>
      )}

      {can('manage_settings') && (
        <section>
          <h2>Settings</h2>
          {/* Settings UI */}
        </section>
      )}
    </div>
  );
}
```

### Example 7: Optimistic Updates

```tsx
// src/pages/Profile.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { apiClient } from '../lib/api-client';

export function ProfileEdit() {
  const { user, updateUser, refetchUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    const updates = { name };

    // Optimistic update
    updateUser(updates);

    try {
      setSaving(true);
      await apiClient.patch(`/users/${user.id}`, updates);

      // Refetch to ensure data consistency
      await refetchUser();

      alert('Profile updated!');
    } catch (err) {
      // Revert optimistic update on error
      await refetchUser();
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
```

---

## Error Handling Patterns

### Pattern 1: Global Error Handler

```typescript
// Add to api-client initialization
apiClient.addErrorInterceptor(async (error) => {
  // Log to error tracking service
  console.error('API Error:', error);

  // Handle specific error codes
  if (error.code === 'TOKEN_EXPIRED') {
    // Redirect to login
    window.location.href = '/login';
  }

  if (error.status === 503) {
    // Show maintenance page
    alert('Service temporarily unavailable');
  }
});
```

### Pattern 2: Component-Level Error Handling

```tsx
try {
  await apiClient.post('/api/users', userData);
} catch (err) {
  if (err instanceof ApiClientError) {
    if (err.isValidationError()) {
      // Handle validation errors
      const errors = err.getValidationErrors();
      setFieldErrors(errors);
    } else if (err.is('EMAIL_EXISTS')) {
      // Handle specific error code
      setError('Email already registered');
    } else {
      // Generic error
      setError(err.message);
    }
  }
}
```

---

## Testing

### Test API Client

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient, ApiClientError } from './api-client';

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient('http://localhost:3000');
  });

  it('should make GET request', async () => {
    const data = await client.get<{ id: number }>('/api/test');
    expect(data).toHaveProperty('id');
  });

  it('should handle errors', async () => {
    try {
      await client.get('/api/nonexistent');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect((err as ApiClientError).status).toBe(404);
    }
  });

  it('should add authorization header', async () => {
    client.setAccessToken('test-token');
    // Mock fetch and verify header
  });
});
```

### Test Auth Context

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-context';

function TestComponent() {
  const { login, user } = useAuth();
  return (
    <div>
      <div>{user?.email || 'Not logged in'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'pass' })}>
        Login
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  it('should login user', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const button = screen.getByText('Login');
    button.click();

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });
});
```

---

## Troubleshooting

### Issue: CORS errors

**Solution:**
```typescript
// Backend (Express)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Frontend - ensure API URL is correct
VITE_API_URL=http://localhost:3000
```

### Issue: Token refresh fails

**Solution:**
- Ensure `/auth/refresh` endpoint exists on backend
- Check refresh token is stored correctly
- Verify refresh token hasn't expired

### Issue: TypeScript errors

**Solution:**
```typescript
// Define your types
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Use with API client
const user = await apiClient.get<User>('/api/users/me');
```

---

## Best Practices

1. **Always define types** - Use TypeScript interfaces for API responses
2. **Handle errors gracefully** - Show user-friendly error messages
3. **Use loading states** - Provide feedback during async operations
4. **Implement retries** - For network failures and 5xx errors
5. **Cache responses** - Consider using React Query or SWR
6. **Secure tokens** - Store in httpOnly cookies when possible
7. **Log errors** - Send to error tracking service (Sentry, etc.)
8. **Test edge cases** - Network errors, timeouts, validation errors

---

## Additional Resources

- **React Documentation:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **Fetch API:** https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- **JWT:** https://jwt.io/
- **React Query:** https://tanstack.com/query/ (recommended for advanced data fetching)

---

**Remember: Type safety + error handling = robust integration**
