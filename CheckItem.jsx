/**
 * components/CheckItem.jsx
 * ─────────────────────────────────────────────────────────────
 * Individual roadmap item with:
 *   - ARIA checkbox role + aria-checked
 *   - Keyboard: Space/Enter to toggle
 *   - Spring check-box animation via Framer Motion
 *   - Done state: strike-through + timestamp + dimmed text
 *   - IMPORTANT badge
 *
 * Props:
 *   item      — { id, text, important? }
 *   onToggle  — () => void
 *   tabIndex  — for roving tabindex pattern
 *   onKeyDown — for arrow-key nav from parent
 */
import { forwardRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useRoadmap } from '../context/RoadmapContext'

/** Format ISO timestamp to short locale date */
function formatTs(ts) {
  if (!ts) return ''
  return 'done ' + new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short'
  })
}

/* Checkmark SVG path */
const CheckSVG = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <polyline
      points="1.5,5 4,7.5 8.5,2.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const CheckItem = forwardRef(function CheckItem({ item, onToggle, tabIndex = 0, onKeyDown }, ref) {
  const { readStates } = useRoadmap()
  const shouldReduce = useReducedMotion()

  const state = readStates[item.id] || { done: false, ts: null }
  const isDone = state.done
  const tsStr = formatTs(state.ts)

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onToggle()
    }
    onKeyDown?.(e)
  }

  return (
    <motion.div
      ref={ref}
      role="checkbox"
      aria-checked={isDone}
      aria-label={item.text}
      tabIndex={tabIndex}
      data-item-id={item.id}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className="check-item"
      /* Micro-hover lift — only if motion OK */
      whileHover={shouldReduce ? {} : { x: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Visual checkbox box */}
      <motion.span
        className="check-box"
        aria-hidden="true"
        animate={isDone
          ? { scale: [1, 1.2, 1], backgroundColor: 'var(--green)', borderColor: 'var(--green)' }
          : { scale: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.22)' }
        }
        transition={shouldReduce
          ? { duration: 0.01 }
          : { type: 'spring', stiffness: 500, damping: 28 }
        }
      >
        <motion.span
          aria-hidden="true"
          animate={isDone
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.4 }
          }
          transition={shouldReduce ? { duration: 0.01 } : { duration: 0.15, delay: 0.04 }}
          style={{ display: 'flex', color: '#000' }}
        >
          <CheckSVG />
        </motion.span>
      </motion.span>

      {/* Item text */}
      <motion.span
        className="check-text"
        animate={isDone
          ? { opacity: 0.32, textDecorationLine: 'line-through' }
          : { opacity: 1, textDecorationLine: 'none' }
        }
        transition={{ duration: shouldReduce ? 0.01 : 0.28 }}
      >
        {item.text}
        {item.important && (
          <span className="important-tag" aria-label="Important">IMPORTANT</span>
        )}
      </motion.span>

      {/* Timestamp — only visible when done */}
      <motion.span
        className="check-ts"
        aria-label={isDone ? tsStr : ''}
        animate={{ opacity: isDone ? 1 : 0 }}
        transition={{ duration: shouldReduce ? 0.01 : 0.25 }}
      >
        {tsStr}
      </motion.span>
    </motion.div>
  )
})
