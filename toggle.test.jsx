/**
 * toggle.test.jsx
 * ─────────────────────────────────────────────────────────────
 * Unit tests for the toggle/persistence logic using
 * Vitest + React Testing Library.
 *
 * Run: npm test (from react-app/)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { RoadmapProvider, useRoadmap } from '../context/RoadmapContext'
import { ToastProvider } from '../components/ToastProvider'

/* ── Mock localStorage ── */
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

/* ── Helper: render with providers ── */
function renderWithProviders(ui) {
  return render(
    <ToastProvider>
      <RoadmapProvider>{ui}</RoadmapProvider>
    </ToastProvider>
  )
}

/* ── Test component that exposes toggle ── */
function ToggleTester({ itemId }) {
  const { readStates, toggleItem } = useRoadmap()
  const isDone = !!readStates[itemId]?.done
  return (
    <div>
      <span data-testid="state">{isDone ? 'done' : 'unread'}</span>
      <button onClick={() => toggleItem(itemId)}>Toggle</button>
    </div>
  )
}

describe('Toggle behavior', () => {
  beforeEach(() => localStorageMock.clear())

  it('starts as unread', () => {
    renderWithProviders(<ToggleTester itemId="la-1" />)
    expect(screen.getByTestId('state').textContent).toBe('unread')
  })

  it('toggles to done on first click', () => {
    renderWithProviders(<ToggleTester itemId="la-1" />)
    fireEvent.click(screen.getByText('Toggle'))
    expect(screen.getByTestId('state').textContent).toBe('done')
  })

  it('toggles back to unread on second click', () => {
    renderWithProviders(<ToggleTester itemId="la-1" />)
    fireEvent.click(screen.getByText('Toggle'))
    fireEvent.click(screen.getByText('Toggle'))
    expect(screen.getByTestId('state').textContent).toBe('unread')
  })

  it('persists done state to localStorage', () => {
    renderWithProviders(<ToggleTester itemId="la-1" />)
    fireEvent.click(screen.getByText('Toggle'))
    const stored = JSON.parse(localStorageMock.getItem('mlRoadmap.readStates'))
    expect(stored['la-1'].done).toBe(true)
    expect(stored['la-1'].ts).toBeTruthy()
  })

  it('persists unread state to localStorage on untoggle', () => {
    renderWithProviders(<ToggleTester itemId="la-1" />)
    fireEvent.click(screen.getByText('Toggle'))
    fireEvent.click(screen.getByText('Toggle'))
    const stored = JSON.parse(localStorageMock.getItem('mlRoadmap.readStates'))
    expect(stored['la-1'].done).toBe(false)
  })

  it('sets a timestamp when marked done', () => {
    const before = Date.now()
    renderWithProviders(<ToggleTester itemId="la-2" />)
    fireEvent.click(screen.getByText('Toggle'))
    const stored = JSON.parse(localStorageMock.getItem('mlRoadmap.readStates'))
    const ts = new Date(stored['la-2'].ts).getTime()
    expect(ts).toBeGreaterThanOrEqual(before)
  })

  it('clears timestamp when marked unread', () => {
    renderWithProviders(<ToggleTester itemId="la-2" />)
    fireEvent.click(screen.getByText('Toggle'))
    fireEvent.click(screen.getByText('Toggle'))
    const stored = JSON.parse(localStorageMock.getItem('mlRoadmap.readStates'))
    expect(stored['la-2'].ts).toBeNull()
  })
})

/* ── Progress calculation tests ── */
function ProgressTester() {
  const { progressPct, doneCount, toggleItem } = useRoadmap()
  return (
    <div>
      <span data-testid="pct">{progressPct}</span>
      <span data-testid="done">{doneCount}</span>
      <button onClick={() => toggleItem('la-1')}>Toggle la-1</button>
    </div>
  )
}

describe('Progress calculation', () => {
  beforeEach(() => localStorageMock.clear())

  it('starts at 0%', () => {
    renderWithProviders(<ProgressTester />)
    expect(screen.getByTestId('pct').textContent).toBe('0')
    expect(screen.getByTestId('done').textContent).toBe('0')
  })

  it('increases when an item is toggled done', () => {
    renderWithProviders(<ProgressTester />)
    fireEvent.click(screen.getByText('Toggle la-1'))
    const pct = parseInt(screen.getByTestId('pct').textContent)
    expect(pct).toBeGreaterThan(0)
    expect(screen.getByTestId('done').textContent).toBe('1')
  })

  it('decreases when item is toggled back', () => {
    renderWithProviders(<ProgressTester />)
    fireEvent.click(screen.getByText('Toggle la-1'))
    fireEvent.click(screen.getByText('Toggle la-1'))
    expect(screen.getByTestId('pct').textContent).toBe('0')
    expect(screen.getByTestId('done').textContent).toBe('0')
  })
})
