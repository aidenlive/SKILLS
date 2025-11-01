---
name: integration-patterns
description: Frontend-backend integration patterns with type safety, error handling, and consistent data flow. Use when connecting frontend and backend, designing API contracts, or implementing data fetching patterns.
version: 1.0.0
---

# Frontend-Backend Integration Patterns

## Purpose

Define patterns for frontend-backend integration with type safety, error handling, and consistent data flow. Reliable communication between client and server.

## When to Use This Skill

- Connecting frontend and backend systems
- Designing API contracts
- Implementing data fetching patterns
- Handling authentication flows
- Managing real-time connections

## Core Principles

- **Type Safety:** Shared types between frontend and backend
- **Error Handling:** Consistent error responses and handling
- **Loading States:** Clear feedback during async operations
- **Optimistic Updates:** Immediate UI feedback with rollback
- **Caching:** Intelligent data caching strategies

## API Client Architecture

### Base Client Setup
```typescript
import type { ApiResponse, ApiError } from '@/shared/types/api';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new ApiClientError(response.status, error.error, error.details);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const api = new ApiClient(import.meta.env.VITE_API_URL);
```

## Data Fetching Patterns

### React Custom Hook
```typescript
import { useState, useEffect } from 'react';
import { api, ApiClientError } from './api-client';

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useQuery<T>(
  endpoint: string,
  options?: { skip?: boolean }
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.get<T>(endpoint);
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
    if (!options?.skip) {
      fetchData();
    }
  }, [endpoint, options?.skip]);

  return { data, loading, error, refetch: fetchData };
}

// Usage
function UserList() {
  const { data: users, loading, error, refetch } = useQuery<User[]>('/api/users');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!users) return null;

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.username}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Mutation Hook
```typescript
interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T>;
  data: T | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useMutation<T, V>(
  mutateFn: (variables: V) => Promise<T>
): UseMutationResult<T, V> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (variables: V) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutateFn(variables);
      setData(result);
      return result;
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

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { mutate, data, loading, error, reset };
}

// Usage
function CreateUser() {
  const { mutate: createUser, loading, error } = useMutation(
    (data: UserCreate) => api.post<User>('/api/users', data)
  );

  const handleSubmit = async (formData: UserCreate) => {
    try {
      const user = await createUser(formData);
      console.log('User created:', user);
    } catch (err) {
      // Error already set in hook
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Authentication Patterns

### Token-Based Auth
```typescript
// Auth service
class AuthService {
  private tokenKey = 'auth_token';

  async login(email: string, password: string): Promise<User> {
    const response = await api.post<{ user: User; token: string }>(
      '/api/auth/login',
      { email, password }
    );

    this.setToken(response.token);
    api.setToken(response.token);

    return response.user;
  }

  async logout(): Promise<void> {
    await api.post('/api/auth/logout', {});
    this.clearToken();
    api.setToken('');
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  async refreshToken(): Promise<string> {
    const response = await api.post<{ token: string }>(
      '/api/auth/refresh',
      {}
    );
    this.setToken(response.token);
    api.setToken(response.token);
    return response.token;
  }
}

export const authService = new AuthService();

// Initialize token on app load
const token = authService.getToken();
if (token) {
  api.setToken(token);
}
```

### Auth Context (React)
```typescript
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = authService.getToken();
    if (token) {
      api.get<User>('/api/auth/me')
        .then(setUser)
        .catch(() => authService.clearToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Error Handling

### Error Boundary
```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Global Error Handler
```typescript
// Display toast notifications for errors
api.onError((error: ApiClientError) => {
  if (error.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.status === 403) {
    toast.error('You do not have permission to perform this action');
  } else if (error.status >= 500) {
    toast.error('Server error. Please try again later.');
  }
});
```

## Optimistic Updates

```typescript
function useOptimisticUpdate<T>() {
  const [optimisticData, setOptimisticData] = useState<T | null>(null);

  const update = async (
    newData: T,
    mutateFn: () => Promise<T>
  ) => {
    // Immediately update UI
    setOptimisticData(newData);

    try {
      // Perform actual update
      const result = await mutateFn();
      setOptimisticData(null);
      return result;
    } catch (error) {
      // Rollback on error
      setOptimisticData(null);
      throw error;
    }
  };

  return { optimisticData, update };
}

// Usage
function TodoItem({ todo }: { todo: Todo }) {
  const { optimisticData, update } = useOptimisticUpdate<Todo>();
  const displayTodo = optimisticData || todo;

  const handleToggle = async () => {
    const updated = { ...todo, completed: !todo.completed };
    await update(updated, () =>
      api.patch<Todo>(`/api/todos/${todo.id}`, updated)
    );
  };

  return (
    <div>
      <input
        type="checkbox"
        checked={displayTodo.completed}
        onChange={handleToggle}
      />
      {displayTodo.title}
    </div>
  );
}
```

## Real-Time Patterns

### WebSocket Connection
```typescript
class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Function>>();

  connect(url: string) {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.emit(message.type, message.data);
    };

    this.ws.onclose = () => {
      // Reconnect logic
      setTimeout(() => this.connect(url), 5000);
    };
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  send(type: string, data: any) {
    this.ws?.send(JSON.stringify({ type, data }));
  }
}

export const ws = new WebSocketClient();
```

## File Upload Pattern

```typescript
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authService.getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const { url } = await response.json();
  return url;
}

// With progress
function useFileUpload() {
  const [progress, setProgress] = useState(0);

  const upload = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress((e.loaded / e.total) * 100);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const { url } = JSON.parse(xhr.responseText);
          resolve(url);
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.open('POST', `${API_BASE_URL}/api/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${authService.getToken()}`);

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  };

  return { upload, progress };
}
```

## Philosophy

**Type-safe communication, graceful error handling, optimistic user experience.**

Reliable by default, responsive through caching, resilient through error boundaries.

## Additional Resources

See `resources/` directory for:
- Complete API client examples
- Authentication flows
- Caching strategies
- WebSocket patterns
- File upload implementations
