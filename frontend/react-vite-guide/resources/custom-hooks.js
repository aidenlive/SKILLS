/**
 * Custom React Hooks
 * Reusable hooks for common patterns
 * Copy these to /src/hooks/
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ============================================
// useFetch - Data fetching with loading and error states
// ============================================

/**
 * Fetch data from an API endpoint
 * Usage:
 *   const { data, loading, error, refetch } = useFetch('/api/users');
 */
export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================
// useLocalStorage - Persist state to localStorage
// ============================================

/**
 * Sync state with localStorage
 * Usage:
 *   const [theme, setTheme] = useLocalStorage('theme', 'light');
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// ============================================
// useTheme - Theme management with system preference
// ============================================

/**
 * Theme switcher with localStorage and system preference
 * Usage:
 *   const { theme, setTheme, toggleTheme } = useTheme();
 */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage(
    'theme',
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}

// ============================================
// useDebounce - Debounce value changes
// ============================================

/**
 * Debounce a value to limit updates
 * Usage:
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// useMediaQuery - Responsive breakpoint detection
// ============================================

/**
 * Detect if media query matches
 * Usage:
 *   const isMobile = useMediaQuery('(max-width: 640px)');
 *   const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (e) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

// ============================================
// useOnClickOutside - Detect clicks outside element
// ============================================

/**
 * Trigger callback when clicking outside element
 * Usage:
 *   const ref = useRef();
 *   useOnClickOutside(ref, () => setIsOpen(false));
 */
export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// ============================================
// useKeyPress - Detect keyboard key presses
// ============================================

/**
 * Detect when a specific key is pressed
 * Usage:
 *   const escapePressed = useKeyPress('Escape');
 *   if (escapePressed) closeModal();
 */
export function useKeyPress(targetKey) {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
}

// ============================================
// useWindowSize - Track window dimensions
// ============================================

/**
 * Get current window size
 * Usage:
 *   const { width, height } = useWindowSize();
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// ============================================
// usePrevious - Get previous value of state
// ============================================

/**
 * Store and return previous value
 * Usage:
 *   const [count, setCount] = useState(0);
 *   const prevCount = usePrevious(count);
 */
export function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============================================
// useToggle - Boolean state toggle
// ============================================

/**
 * Toggle boolean state
 * Usage:
 *   const [isOpen, toggleOpen] = useToggle(false);
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  return [value, toggle, setValue];
}

// ============================================
// useAsync - Handle async operations
// ============================================

/**
 * Execute async function with loading/error states
 * Usage:
 *   const { execute, loading, error, data } = useAsync();
 *   await execute(() => fetchUserData(userId));
 */
export function useAsync() {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction) => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
      throw error;
    }
  }, []);

  return {
    execute,
    status,
    data,
    error,
    loading: status === 'pending',
  };
}

// ============================================
// useForm - Form state management
// ============================================

/**
 * Manage form state and validation
 * Usage:
 *   const { values, errors, handleChange, handleSubmit } = useForm({
 *     initialValues: { email: '', password: '' },
 *     onSubmit: (values) => console.log(values),
 *     validate: (values) => {
 *       const errors = {};
 *       if (!values.email) errors.email = 'Required';
 *       return errors;
 *     }
 *   });
 */
export function useForm({ initialValues, onSubmit, validate }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Validate
      const validationErrors = validate ? validate(values) : {};
      setErrors(validationErrors);

      // Submit if no errors
      if (Object.keys(validationErrors).length === 0) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    },
    [values, validate, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors,
  };
}

// ============================================
// useIntersectionObserver - Visibility detection
// ============================================

/**
 * Detect when element enters viewport
 * Usage:
 *   const ref = useRef();
 *   const isVisible = useIntersectionObserver(ref);
 */
export function useIntersectionObserver(
  ref,
  options = { threshold: 0.1 }
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

// ============================================
// useScrollPosition - Track scroll position
// ============================================

/**
 * Get current scroll position
 * Usage:
 *   const { x, y } = useScrollPosition();
 */
export function useScrollPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

// ============================================
// useTimeout - Execute callback after delay
// ============================================

/**
 * Execute callback after specified delay
 * Usage:
 *   useTimeout(() => console.log('Delayed!'), 1000);
 */
export function useTimeout(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

// ============================================
// useInterval - Execute callback at intervals
// ============================================

/**
 * Execute callback at regular intervals
 * Usage:
 *   useInterval(() => setCount(c => c + 1), 1000);
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
