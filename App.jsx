/**
 * App.jsx
 * ─────────────────────────────────────────────────────────────
 * Root component. Wires providers and renders the phase list.
 *
 * Provider order (outer → inner):
 *   ToastProvider  — global toast queue
 *   RoadmapProvider — central state + persistence
 */
import { motion, useReducedMotion } from 'framer-motion'
import { RoadmapProvider } from './context/RoadmapContext'
import { ToastProvider } from './components/ToastProvider'
import { TopBar } from './components/TopBar'
import { PhaseCard } from './components/PhaseCard'
import { PHASES } from './data/roadmapData'
import './styles.css'

function RoadmapApp() {
  const shouldReduce = useReducedMotion()

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="app">
      {/* ── Header ── */}
      <motion.header
        className="site-header"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        transition={shouldReduce ? { duration: 0.01 } : { duration: 0.6 }}
      >
        <p className="eyebrow">10 Phases · Builder Path</p>
        <h1>ML Engineering<br />Mastery</h1>
        <p className="subtitle">Tick off each concept as you conquer it. No shortcuts.</p>
      </motion.header>

      {/* ── Progress + sync ── */}
      <TopBar />

      {/* ── Phase list ── */}
      <main aria-label="ML Engineering Roadmap">
        {PHASES.map(phase => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <RoadmapProvider>
        <RoadmapApp />
      </RoadmapProvider>
    </ToastProvider>
  )
}
