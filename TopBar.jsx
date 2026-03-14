/**
 * components/TopBar.jsx
 * ─────────────────────────────────────────────────────────────
 * Global progress bar + server-sync toggle.
 * Uses Framer Motion to animate the progress bar width.
 */
import { motion, useReducedMotion } from 'framer-motion'
import { useRoadmap } from '../context/RoadmapContext'

export function TopBar() {
  const { progressPct, doneCount, totalCount, syncEnabled, setSyncEnabled, isSyncing } = useRoadmap()
  const shouldReduce = useReducedMotion()

  const toggleSync = () => {
    setSyncEnabled(v => !v)
  }

  return (
    <div className="top-bar">
      {/* ── Progress bar ── */}
      <div className="progress-wrap">
        <div className="progress-label">
          <span>Overall Progress</span>
          <span>{doneCount}/{totalCount} &middot; {progressPct}%</span>
        </div>
        <div
          className="progress-bar-outer"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
          aria-label="Overall roadmap progress"
        >
          <motion.div
            className="progress-bar-inner"
            animate={{ width: `${progressPct}%` }}
            transition={shouldReduce
              ? { duration: 0.01 }
              : { type: 'spring', stiffness: 120, damping: 22 }
            }
          />
        </div>
      </div>

      {/* ── Sync toggle ── */}
      <label className="sync-toggle" title="Sync progress to server (stub)">
        <input
          type="checkbox"
          checked={syncEnabled}
          onChange={toggleSync}
          aria-label="Sync to server"
        />
        <span
          className="toggle-pill"
          role="switch"
          aria-checked={syncEnabled}
        />
        <span>{isSyncing ? '⟳ Syncing…' : 'Sync'}</span>
      </label>
    </div>
  )
}
