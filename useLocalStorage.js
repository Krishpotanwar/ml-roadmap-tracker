/**
 * hooks/useLocalStorage.js
 * ─────────────────────────────────────────────────────────────
 * Generic hook that syncs React state with localStorage.
 * Handles JSON serialisation, parse errors, and storage-full errors.
 */
import { useState, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      // Corrupted data — fall back to initial
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    setStoredValue(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch (e) {
        // Storage quota exceeded — keep in-memory only
        console.warn('[useLocalStorage] Storage full:', e)
        window.dispatchEvent(new CustomEvent('mlRoadmap:storageError'))
      }
      return next
    })
  }, [key])

  return [storedValue, setValue]
}
