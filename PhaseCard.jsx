/**
 * components/PhaseCard.jsx
 * ─────────────────────────────────────────────────────────────
 * Glass card for a single roadmap phase.
 *
 * Features:
 *   - Glass effect: backdrop-filter + fallback via @supports CSS
 *   - Collapsible body via Framer Motion AnimatePresence + layout
 *   - Per-phase progress ring (SVG)
 *   - "All done" badge animation
 *   - Bulk mark all done / clear
 *   - Roving tabindex for arrow-key navigation within items
 *   - ARIA: aria-expanded, aria-controls, region role
 *   - Intersection Observer lazy animation trigger
 */
import { useState, useRef, useCallback, useEffect, useId } from 'react'
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion'
import { CheckItem } from './CheckItem'
import { useRoadmap } from '../context/RoadmapContext'
import { useToast } from './ToastProvider'

/* ── SVG Ring constants ── */
const RING_R = 12
const RING_CIRC = 2 * Math.PI * RING_R

/* ── Chevron icon ── */
const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <polyline points="3,5 8,11 13,5" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function PhaseCard({ phase }) {
  const uid = useId()
  const bodyId = `${uid}-body`
  const titleId = `${uid}-title`

  const { readStates, toggleItem, restoreItem, bulkTogglePhase, restorePhase, getPhaseStats } = useRoadmap()
  const { showToast } = useToast()
  const shouldReduce = useReducedMotion()

  const [isOpen, setIsOpen] = useState(false)

  /* ── Intersection observer for lazy entrance animation ── */
  const cardRef = useRef(null)
  const isInView = useInView(cardRef, { once: true, margin: '-60px' })

  /* ── Derive phase item IDs (stable per phase) ── */
  const phaseItemIds = phase.sections.flatMap(s => s.items.map(i => i.id))
  const { done, total } = getPhaseStats(phaseItemIds)
  const allDone = done === total && total > 0
  const pct = total ? done / total : 0
  const ringOffset = RING_CIRC * (1 - pct)

  /* ── Roving tabindex for item list ── */
  const itemRefs = useRef([])

  const handleItemKeyDown = useCallback((e, flatIndex) => {
    const items = itemRefs.current.filter(Boolean)
    if (e.key === 'ArrowDown' && items[flatIndex + 1]) {
      e.preventDefault()
      items.forEach((el, i) => el.setAttribute('tabindex', i === flatIndex + 1 ? '0' : '-1'))
      items[flatIndex + 1].focus()
    }
    if (e.key === 'ArrowUp' && items[flatIndex - 1]) {
      e.preventDefault()
      items.forEach((el, i) => el.setAttribute('tabindex', i === flatIndex - 1 ? '0' : '-1'))
      items[flatIndex - 1].focus()
    }
  }, [])

  /* ── Toggle a single item with undo ── */
  const handleToggle = useCallback((itemId) => {
    const prev = readStates[itemId]
    toggleItem(itemId)

    const willBeDone = !readStates[itemId]?.done
    showToast(
      willBeDone ? '✓ Marked as done' : '↩ Marked as unread',
      () => restoreItem(itemId, prev)
    )
  }, [readStates, toggleItem, restoreItem, showToast])

  /* ── Bulk toggle with undo ── */
  const handleBulk = useCallback((markDone) => {
    // Snapshot current state for undo
    const snapshot = {}
    phaseItemIds.forEach(id => { snapshot[id] = readStates[id] })

    bulkTogglePhase(phaseItemIds, markDone)

    showToast(
      markDone ? '✓ Phase marked as complete' : '↩ Phase cleared',
      () => restorePhase(snapshot)
    )
  }, [phaseItemIds, readStates, bulkTogglePhase, restorePhase, showToast])

  /* ── Flatten items for rendering with stable indices ── */
  let flatIndex = 0
  const allFlatItems = phase.sections.flatMap(s => s.items)

  /* ── Card entrance variants ── */
  const cardVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
  }

  return (
    <motion.article
      ref={cardRef}
      className={`phase-card${allDone ? ' all-done' : ''}`}
      id={phase.id}
      aria-labelledby={titleId}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      /* Hover lift (not on mobile touch) */
      whileHover={shouldReduce ? {} : { y: -3, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
    >
      {/* ── Phase header / expand toggle ── */}
      <button
        className="phase-header"
        id={titleId}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={() => setIsOpen(o => !o)}
      >
        <span className="phase-num">PH{phase.num}</span>

        <span className="phase-title">
          {phase.title}
          <span className="phase-subtitle">{phase.subtitle}</span>
        </span>

        <span className="phase-meta">
          {/* All-done badge */}
          <AnimatePresence>
            {allDone && (
              <motion.span
                className="phase-all-done-badge"
                aria-label="Phase complete"
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={shouldReduce ? { duration: 0.01 } : { type: 'spring', stiffness: 400, damping: 20 }}
              >
                ✓ Done
              </motion.span>
            )}
          </AnimatePresence>

          {/* Item count */}
          <span className="phase-count" aria-label="Items completed">
            {done}/{total}
          </span>

          {/* Progress ring */}
          <span className="ring-wrap" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle className="ring-bg" cx="16" cy="16" r={RING_R} />
              <motion.circle
                className="ring-fg"
                cx="16" cy="16" r={RING_R}
                strokeDasharray={RING_CIRC}
                animate={{ strokeDashoffset: ringOffset }}
                transition={shouldReduce ? { duration: 0.01 } : { duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />
            </svg>
            <span className="ring-pct">{Math.round(pct * 100)}%</span>
          </span>

          {/* Chevron */}
          <motion.span
            className="phase-chevron"
            aria-hidden="true"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={shouldReduce ? { duration: 0.01 } : { duration: 0.28 }}
          >
            <Chevron />
          </motion.span>
        </span>
      </button>

      {/* ── Collapsible body ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={bodyId}
            role="region"
            aria-labelledby={titleId}
            className="phase-body-animated"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={shouldReduce
              ? { duration: 0.01 }
              : { height: { type: 'spring', stiffness: 280, damping: 28 },
                  opacity: { duration: 0.22 } }
            }
            style={{ overflow: 'hidden' }}
          >
            <div className="phase-body-inner">
              {/* Section groups */}
              {phase.sections.map(section => (
                <div key={section.label} className="section-group">
                  <div className="section-label">{section.label}</div>
                  {section.items.map((item) => {
                    const fi = flatIndex++
                    return (
                      <CheckItem
                        key={item.id}
                        item={item}
                        onToggle={() => handleToggle(item.id)}
                        tabIndex={fi === 0 ? 0 : -1}
                        onKeyDown={(e) => handleItemKeyDown(e, fi)}
                        ref={(el) => { itemRefs.current[fi] = el }}
                      />
                    )
                  })}
                </div>
              ))}

              {/* Checkpoint */}
              <div className="checkpoint-row">
                <span className="cp-label">✦ CHECKPOINT {phase.num}</span>
                {phase.checkpoint.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>

              {/* Bulk controls */}
              <div className="bulk-row">
                <button
                  className="btn-bulk"
                  onClick={() => handleBulk(true)}
                  aria-label={`Mark all items in ${phase.title} as done`}
                >
                  Mark all done
                </button>
                <button
                  className="btn-bulk"
                  onClick={() => handleBulk(false)}
                  aria-label={`Clear all items in ${phase.title}`}
                >
                  Clear phase
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
