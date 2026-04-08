import { useEffect, useCallback } from 'react';

/**
 * Global keyboard shortcut listener
 * @param {string} key - e.g. "k"
 * @param {boolean} ctrlKey - whether Cmd/Ctrl must be held
 * @param {function} callback - fires on match
 */
export const useHotkeys = (key, ctrlKey, callback) => {
  const handleKeyDown = useCallback((event) => {
    // Determine if user holds Cmd (Mac) or Ctrl (Windows)
    const isModifier = event.metaKey || event.ctrlKey;
    
    if (ctrlKey && !isModifier) return;
    if (event.key.toLowerCase() === key.toLowerCase()) {
      event.preventDefault();
      callback(event);
    }
  }, [key, ctrlKey, callback]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
