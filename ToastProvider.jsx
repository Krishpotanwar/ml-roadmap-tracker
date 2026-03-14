/**
 * components/ToastProvider.jsx
 * ─────────────────────────────────────────────────────────────
 * Global toast / snackbar system with:
 *   - ARIA live region (role="status", aria-live="polite")
 *   - Undo callback support
 *   - Framer Motion enter/exit animations
 *   - Auto-dismiss after 3.5 s
 *   - Escape key to dismiss focused toast
 */
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const ToastContext = createContext(null)

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const shouldReduce = useReducedMotion()

  const dismiss = useCallback((id) => {
    setToasts(ts => ts.filter(t => t.id !== id))
  }, [])

  /** Show a toast. undoFn is optional — renders an "Undo" button. */
  const showToast = useCallback((msg, undoFn = null, duration = 3500) => {
    const id = ++nextId
    setToasts(ts => [...ts, { id, msg, undoFn }])
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const handleUndo = useCallback((id, undoFn) => {
    undoFn?.()
    dismiss(id)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* ── ARIA live region — read by screen readers on every change ── */}
      <div
        id="live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute', width: 1, height: 1,
          overflow: 'hidden', clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap'
        }}
      >
        {toasts[toasts.length - 1]?.msg}
      </div>

      {/* ── Toast stack ── */}
      <div
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '.5rem',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              role="status"
              className="toast"
              initial={shouldReduce ? {} : { opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduce ? {} : { opacity: 0, y: 8, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              style={{ pointerEvents: 'auto' }}
              onKeyDown={(e) => { if (e.key === 'Escape') dismiss(toast.id) }}
            >
              <span>{toast.msg}</span>
              {toast.undoFn && (
                <button
                  className="toast-undo"
                  onClick={() => handleUndo(toast.id, toast.undoFn)}
                  aria-label="Undo last action"
                >
                  Undo
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
