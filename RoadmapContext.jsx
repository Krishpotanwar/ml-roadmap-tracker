/**
 * context/RoadmapContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Central state for all toggle read-states, progress tracking,
 * server-sync, and analytics emission.
 *
 * Architecture:
 *   - readStates: { [itemId]: { done: boolean, ts: string|null } }
 *   - Persisted to localStorage under key "mlRoadmap.readStates"
 *   - Server sync is opt-in; calls syncToServer() on each change
 *   - Analytics events emitted to window.dataLayer
 */
import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getAllItemIds } from '../data/roadmapData'

/* ── Storage key namespace ── */
const STORAGE_KEY = 'mlRoadmap.readStates'

/* ── Server sync stub ─────────────────────────────────────── */
/**
 * Replace the body of this function with a real fetch() call.
 * Shape: POST /api/user/readStates  { readStates: { [id]: {...} } }
 */
async function syncToServer(readStates) {
  console.log('[sync] Pushing to /api/user/readStates:', readStates)
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/readStates`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ readStates }),
  // })
  // if (!res.ok) throw new Error('Sync failed')
}

/* ── Analytics hook ───────────────────────────────────────── */
function emitAnalytics(event, payload) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, timestamp: new Date().toISOString(), ...payload })
}

/* ── Debounce ─────────────────────────────────────────────── */
function useDebouncedCallback(fn, ms) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), ms)
  }, [fn, ms])
}

/* ═══════════════════════════════════════════════════════════ */
const RoadmapContext = createContext(null)

export function RoadmapProvider({ children }) {
  const [readStates, setReadStates] = useLocalStorage(STORAGE_KEY, {})
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  /* Debounced server push */
  const debouncedSync = useDebouncedCallback(async (states) => {
    if (!syncEnabled) return
    setIsSyncing(true)
    try {
      await syncToServer(states)
    } catch (e) {
      console.error('[sync] failed:', e)
    } finally {
      setIsSyncing(false)
    }
  }, 800)

  /* Listen for storage-full events from the hook */
  useEffect(() => {
    const handler = () => {
      window.dispatchEvent(new CustomEvent('mlRoadmap:toast', {
        detail: { msg: '⚠️ Storage full — progress saved in memory only.' }
      }))
    }
    window.addEventListener('mlRoadmap:storageError', handler)
    return () => window.removeEventListener('mlRoadmap:storageError', handler)
  }, [])

  /* ── Toggle a single item ─────────────────────────────── */
  const toggleItem = useCallback((itemId) => {
    setReadStates(prev => {
      const wasDone = !!prev[itemId]?.done
      const nowDone = !wasDone
      const next = {
        ...prev,
        [itemId]: { done: nowDone, ts: nowDone ? new Date().toISOString() : null }
      }
      if (syncEnabled) debouncedSync(next)
      emitAnalytics('roadmap_item_toggle', { itemId, done: nowDone })
      return next
    })
  }, [setReadStates, syncEnabled, debouncedSync])

  /* ── Restore a single item (for undo) ────────────────── */
  const restoreItem = useCallback((itemId, previousState) => {
    setReadStates(prev => {
      const next = { ...prev, [itemId]: previousState }
      if (syncEnabled) debouncedSync(next)
      return next
    })
  }, [setReadStates, syncEnabled, debouncedSync])

  /* ── Bulk toggle an entire phase ─────────────────────── */
  const bulkTogglePhase = useCallback((phaseItemIds, markDone) => {
    const ts = new Date().toISOString()
    setReadStates(prev => {
      const snapshot = {}
      phaseItemIds.forEach(id => { snapshot[id] = prev[id] })
      const next = { ...prev }
      phaseItemIds.forEach(id => {
        next[id] = { done: markDone, ts: markDone ? ts : null }
      })
      if (syncEnabled) debouncedSync(next)
      emitAnalytics('roadmap_phase_bulk', { count: phaseItemIds.length, done: markDone })
      return next
    })
  }, [setReadStates, syncEnabled, debouncedSync])

  /* ── Bulk restore a phase (for undo) ─────────────────── */
  const restorePhase = useCallback((snapshot) => {
    setReadStates(prev => ({ ...prev, ...snapshot }))
  }, [setReadStates])

  /* ── Derived: overall progress ───────────────────────── */
  const allIds = getAllItemIds()
  const doneCount = allIds.filter(id => readStates[id]?.done).length
  const totalCount = allIds.length
  const progressPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0

  /* ── Phase-level stats ───────────────────────────────── */
  const getPhaseStats = useCallback((phaseItemIds) => {
    const done = phaseItemIds.filter(id => readStates[id]?.done).length
    return { done, total: phaseItemIds.length }
  }, [readStates])

  const value = {
    readStates,
    syncEnabled, setSyncEnabled,
    isSyncing,
    toggleItem,
    restoreItem,
    bulkTogglePhase,
    restorePhase,
    progressPct,
    doneCount,
    totalCount,
    getPhaseStats,
  }

  return (
    <RoadmapContext.Provider value={value}>
      {children}
    </RoadmapContext.Provider>
  )
}

/** Consume roadmap context */
export function useRoadmap() {
  const ctx = useContext(RoadmapContext)
  if (!ctx) throw new Error('useRoadmap must be used inside <RoadmapProvider>')
  return ctx
}
