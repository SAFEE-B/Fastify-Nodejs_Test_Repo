import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param {*} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {*} - The debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debouncing search terms
 * @param {string} searchTerm - The search term to debounce
 * @param {number} delay - The delay in milliseconds (default: 500)
 * @returns {string} - The debounced search term
 */
export function useSearchDebounce(searchTerm, delay = 500) {
  return useDebounce(searchTerm, delay);
} 