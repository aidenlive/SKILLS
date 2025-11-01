# React + Vite Guide Resources

This directory contains production-ready React components, custom hooks, and Vite configuration templates for building modern React applications with zero config overhead.

## Files

### `component-templates.jsx`
Production-ready React components using functional components and hooks.

**Includes:**
- Button (variants, sizes, disabled states)
- Card (with header, body, footer sub-components)
- Modal (with focus trap and keyboard handling)
- Input (with labels, errors, validation)
- Spinner (loading states)
- Alert/Toast (notifications)
- Tabs (keyboard navigation)
- Dropdown (click-outside handling)
- Layout components (Container, Stack, Grid)

**Usage:**
```jsx
import { Button, Card, Modal } from '@/components';

// Button
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

// Card
<Card variant="elevated">
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card>

// Modal
const [isOpen, setIsOpen] = useState(false);
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal">
  <p>Content here</p>
</Modal>
```

### `custom-hooks.js`
Reusable custom hooks for common React patterns.

**Includes:**
- `useFetch` - Data fetching with loading/error states
- `useLocalStorage` - Persist state to localStorage
- `useTheme` - Theme management with system preference
- `useDebounce` - Debounce value changes
- `useMediaQuery` - Responsive breakpoint detection
- `useOnClickOutside` - Detect clicks outside element
- `useKeyPress` - Keyboard key detection
- `useWindowSize` - Track window dimensions
- `usePrevious` - Get previous value of state
- `useToggle` - Boolean state toggle
- `useAsync` - Handle async operations
- `useForm` - Form state management
- `useIntersectionObserver` - Visibility detection
- `useScrollPosition` - Track scroll position
- `useTimeout` / `useInterval` - Timers

**Usage:**
```jsx
import { useFetch, useTheme, useDebounce } from '@/hooks';

// Fetch data
const { data, loading, error } = useFetch('/api/users');

// Theme switcher
const { theme, toggleTheme } = useTheme();

// Debounce search
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);
```

### `vite-config-template.js`
Complete Vite configuration with path aliases, build optimization, and development server setup.

**Features:**
- React plugin configuration
- Path aliases (@, @components, @hooks, etc.)
- Development server with proxy
- Build optimization (chunk splitting, minification)
- CSS preprocessing setup
- Environment variables

**Usage:**
```bash
# Copy to project root
cp resources/vite-config-template.js vite.config.js

# Customize:
# - Update path aliases
# - Configure API proxy
# - Adjust build options
```

## Quick Start

### 1. Create New Project

```bash
# Create Vite + React project
npm create vite@latest my-react-app -- --template react
cd my-react-app

# Install dependencies
npm install

# Copy resources
cp -r /path/to/resources/* ./src/
```

### 2. Project Structure

```
my-react-app/
├── index.html
├── vite.config.js
├── package.json
├── /src
│   ├── /components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── Modal.jsx
│   ├── /hooks
│   │   ├── useFetch.js
│   │   ├── useTheme.js
│   │   └── useForm.js
│   ├── /pages
│   │   ├── Home.jsx
│   │   └── Dashboard.jsx
│   ├── /styles
│   │   ├── tokens.css
│   │   ├── reset.css
│   │   └── components.css
│   ├── /utils
│   │   ├── api.js
│   │   └── validators.js
│   ├── App.jsx
│   └── main.jsx
├── /public
│   ├── favicon.ico
│   └── manifest.json
└── /tests
    └── setup.js
```

### 3. Setup Vite Config

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
});
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Component Examples

### Button Component

```jsx
import { Button } from '@/components';

function Example() {
  return (
    <div>
      <Button variant="primary" onClick={() => alert('Clicked!')}>
        Primary
      </Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost" size="sm">Ghost Small</Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}
```

### Modal Component

```jsx
import { useState } from 'react';
import { Modal, Button } from '@/components';

function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action">
        <p>Are you sure you want to proceed?</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="primary" onClick={() => setIsOpen(false)}>
            Confirm
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
```

### Form with Validation

```jsx
import { Input, Button } from '@/components';
import { useForm } from '@/hooks';

function LoginForm() {
  const { values, errors, handleChange, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors = {};
      if (!values.email) {
        errors.email = 'Email is required';
      }
      if (!values.password || values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      return errors;
    },
    onSubmit: async (values) => {
      console.log('Submitting:', values);
      // API call here
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        required
      />

      <Button type="submit" variant="primary">
        Login
      </Button>
    </form>
  );
}
```

## Custom Hooks Examples

### Data Fetching

```jsx
import { useFetch } from '@/hooks';

function UserList() {
  const { data, loading, error, refetch } = useFetch('/api/users');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {data.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Theme Switching

```jsx
import { useTheme } from '@/hooks';
import { Button } from '@/components';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme}>
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </Button>
  );
}
```

### Debounced Search

```jsx
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks';
import { Input } from '@/components';

function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // Perform search
      console.log('Searching for:', debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <Input
      type="search"
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

### Responsive Design

```jsx
import { useMediaQuery } from '@/hooks';

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div>
      {isMobile && <p>Mobile view</p>}
      {isDesktop && <p>Desktop view</p>}
    </div>
  );
}
```

## Best Practices

### Component Organization

```jsx
// ✅ DO: Small, focused components
function Button({ children, ...props }) {
  return <button className="btn" {...props}>{children}</button>;
}

// ❌ DON'T: Large, monolithic components
function Dashboard() {
  // 500+ lines of code...
}
```

### Props Destructuring

```jsx
// ✅ DO: Destructure props
function Card({ title, description, footer }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{description}</p>
      <div>{footer}</div>
    </div>
  );
}

// ❌ DON'T: Use props object
function Card(props) {
  return <div className="card">{props.title}</div>;
}
```

### Memoization

```jsx
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ data, onUpdate }) {
  // Memoize expensive computation
  const processedData = useMemo(() => {
    return data.map(item => /* expensive operation */);
  }, [data]);

  // Memoize callback
  const handleClick = useCallback(() => {
    onUpdate(processedData);
  }, [processedData, onUpdate]);

  return <button onClick={handleClick}>Process</button>;
}
```

### Error Boundaries

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## Testing

### Component Testing

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

test('button renders and responds to clicks', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);

  const button = screen.getByText('Click Me');
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Hook Testing

```jsx
import { renderHook, act } from '@testing-library/react';
import { useToggle } from './useToggle';

test('useToggle toggles value', () => {
  const { result } = renderHook(() => useToggle(false));

  expect(result.current[0]).toBe(false);

  act(() => {
    result.current[1](); // Toggle
  });

  expect(result.current[0]).toBe(true);
});
```

## Performance Optimization

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### Image Optimization

```jsx
function OptimizedImage({ src, alt, ...props }) {
  return (
    <picture>
      <source srcSet={`${src}.avif`} type="image/avif" />
      <source srcSet={`${src}.webp`} type="image/webp" />
      <img src={`${src}.jpg`} alt={alt} loading="lazy" {...props} />
    </picture>
  );
}
```

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

```bash
# .env.production
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
```

```jsx
// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
```

### Deploy to Netlify/Vercel

```bash
# Netlify
netlify deploy --prod --dir=dist

# Vercel
vercel --prod
```

## Related Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Vitest](https://vitest.dev/)

## Tips

1. **Start simple** - Copy templates, customize incrementally
2. **Use composition** - Build complex UIs from simple components
3. **Memoize wisely** - Only memoize expensive operations
4. **Test interactivity** - Write tests for user interactions
5. **Stay functional** - Prefer hooks over class components
6. **Think mobile-first** - Design for 320px, scale up
7. **Keep components pure** - Avoid side effects in render
