/**
 * Example Custom Hook for Lector Review
 *
 * This demonstrates the standard custom hook pattern used in this project.
 * Copy and adapt this template when creating new hooks.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing data with loading and error states
 *
 * @param initialValue - Initial value for the data
 * @param fetchFn - Async function to fetch data
 * @returns Object containing data, loading state, error, and refresh function
 *
 * @example
 * const { data, isLoading, error, refresh } = useDataManager(
 *   null,
 *   async () => fetchDataFromAPI()
 * );
 */
export function useDataManager<T>(
  initialValue: T | null,
  fetchFn: () => Promise<T>
) {
  // ==================== STATE ====================
  const [data, setData] = useState<T | null>(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ==================== REFS ====================
  // Use refs for values that shouldn't trigger re-renders
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ==================== CALLBACKS ====================
  const loadData = useCallback(async () => {
    try {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      const result = await fetchFn();

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setData(result);
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }

      console.error('Data loading failed:', err);

      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }

    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchFn]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const updateData = useCallback((newData: T) => {
    setData(newData);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadData();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  // ==================== RETURN ====================
  return {
    data,
    isLoading,
    error,
    refresh,
    updateData,
    clearError,
  };
}

// ==================== USAGE EXAMPLE ====================

/*
import { useDataManager } from '@/hooks';

function MyComponent() {
  const {
    data,
    isLoading,
    error,
    refresh
  } = useDataManager<UserData>(
    null,
    async () => {
      const response = await fetch('/api/user');
      return response.json();
    }
  );

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} onRetry={refresh} />;
  if (!data) return <Empty />;

  return <UserProfile data={data} />;
}
*/

// ==================== ADVANCED EXAMPLE ====================

/**
 * Custom hook for LocalStorage with type safety and reactivity
 *
 * @param key - LocalStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the value
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function for same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

// ==================== HOOK BEST PRACTICES ====================

/*
1. ✅ Prefix hook names with 'use'
2. ✅ Return object for multiple values: { value, setValue, error }
3. ✅ Return array for single/simple values: [value, setValue]
4. ✅ Use useCallback for returned functions
5. ✅ Include cleanup in useEffect
6. ✅ Check if mounted before setState
7. ✅ Add JSDoc documentation
8. ✅ Provide usage examples
9. ✅ Handle loading and error states
10. ✅ Make hooks composable

❌ Don't call hooks conditionally
❌ Don't call hooks in loops
❌ Don't forget dependencies in useEffect/useCallback
❌ Don't mutate state directly
❌ Don't forget to cleanup subscriptions/timers
*/
