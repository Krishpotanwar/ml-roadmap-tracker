# ML Roadmap Glass UI — Architecture Document

**Version:** 1.0  
**Stack:** React 18 + Vite + Tailwind CSS + Framer Motion  
**Scope:** Single-page interactive checklist with glassmorphic UI, local persistence, server-sync stub, ARIA-compliant

---

## 1. Component Structure

```
App
├── RoadmapProvider          — context: readStates, dispatch, sync
│   ├── ProgressBar          — % phases completed, aria-valuenow
│   ├── ToastProvider        — undo snackbar (aria-live="polite")
│   └── PhaseList
│       └── PhaseCard        — glass card per phase
│           ├── PhaseHeader  — toggle expand, phase title/badge
│           └── ItemList
│               └── CheckItem — individual checkbox with timestamp
```

### Data Flow (one-way)

```
ml_roadmap.txt (static JSON parse)
        │
        ▼
  roadmapData.js  ─── static tree: [{id, title, items[]}]
        │
        ▼
  RoadmapProvider  ─── readStates: {itemId: {done, ts}}
        │                      ↕  localStorage (mlRoadmap.readStates)
        ▼
  PhaseCard / CheckItem  ─── read/write via useRoadmap() hook
        │
        ▼
  sync() stub  ─── POST /api/user/readStates  (opt-in toggle)
```

---

## 2. Persistence Strategy

### Local (default, zero-latency)
- **Key:** `mlRoadmap.readStates`
- **Value:** `{ [itemId]: { done: boolean, ts: ISO-string } }`
- Written on every toggle via a `useLocalStorage` hook that debounces 300 ms.
- Read once on mount; hydrates context before first paint (no flash of wrong state).

### Server (opt-in)
- A `<SyncToggle>` control in the top bar lets the user opt in.
- When enabled, every write queues a `POST /api/user/readStates` with the full delta.
- The `sync()` function is a **stub** — it logs and resolves; swap for a real fetch call.
- Optimistic update pattern: local state updates immediately; server failure triggers toast + rollback.

---

## 3. Glass Effect — Technique Rationale

| Layer | CSS | Why |
|---|---|---|
| Background blur | `backdrop-filter: blur(8px) saturate(120%)` | Native GPU compositing, no JS |
| Card fill | `background: rgba(255,255,255,0.06)` | Barely-there tint, keeps blur dominant |
| Border | `1px solid rgba(255,255,255,0.12)` | Defines edge without breaking the glass |
| Fallback | `background: rgba(20,20,35,0.80)` | For browsers without backdrop-filter support |
| Shadow | `0 8px 32px rgba(0,0,0,0.35)` | Depth without color |

Feature-detect: `@supports (backdrop-filter: blur(1px)) { ... }` in global CSS.  
IE11 / old Edge not supported; shows solid dark card instead (acceptable graceful degradation).

### Fog / Frost Reveal Animation
- A CSS `::before` pseudo-element on each card carries an animated radial-gradient (`keyframes fogPulse`) that drifts across the surface.
- On "read" state, this fog fades out (`opacity → 0`) and text desaturates (`filter: saturate(0.4)`).
- This purely CSS approach keeps bundle weight zero; replace with a Lottie JSON for richer per-card particle fog if desired.

---

## 4. Animation Choices

| Interaction | Mechanism | Rationale |
|---|---|---|
| Card mount | Framer Motion `initial/animate` (y + opacity) with `staggerChildren` | Physics-feel stagger without complex custom easing |
| Expand/collapse | Framer `AnimatePresence` + `height: auto` via layout animation | No height calculation needed; Framer measures the DOM |
| Checkbox toggle | CSS `transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1)` | Springy feel, zero JS |
| Hover lift | `translateY(-2px)` + shadow intensify on `:hover` | Reinforces "card" metaphor |
| Undo snackbar | `AnimatePresence` slide-from-bottom | Visible but non-blocking |

`will-change: transform` is applied **only** during active animations via Framer's automatic handling — not statically — to avoid unnecessary compositing layers on mobile.

---

## 5. Accessibility

- **Keyboard:** Tab order follows DOM order. `Enter`/`Space` toggles checkboxes. Phase headers are `<button>` elements, reachable and activatable.
- **ARIA:**
  - CheckItem: `role="checkbox"`, `aria-checked`, `aria-label="[phase] — [item]"`
  - PhaseCard: `aria-expanded`, `aria-controls`
  - Progress: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`
  - Toast: `role="status"`, `aria-live="polite"` (non-disruptive; "assertive" only for errors)
- **Color contrast:** "Done" state dims text to ~50% opacity. A minimum contrast of 3.5:1 is maintained against the card background by keeping the dark theme deep (`#0a0b14` base). Verified via axe-core in CI.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` collapses all Framer durations to `0.01s`. The hook `useReducedMotion()` (Framer built-in) gates animation variants.

---

## 6. Performance Considerations

- **Intersection Observer:** PhaseCards animate in only when visible (lazy mount animations via `whileInView`).
- **Lazy parsing:** `roadmapData.js` is a pre-parsed static module (build-time); no runtime text-parsing on load.
- **Memoization:** `PhaseCard` and `CheckItem` are wrapped in `React.memo`; toggle dispatch targets a single item ID, preventing full re-render of siblings.
- **Bundle:** Framer Motion tree-shakes well with Vite. Estimated total gzipped bundle: ~85 KB (React 18 ~45 KB + Framer ~35 KB + app ~5 KB).
- **CSS backdrop-filter** triggers GPU compositing layer per card — limit to ≤20 simultaneously visible cards to avoid memory pressure on mobile. The intersection observer naturally gates this.

---

## 7. Testing Checklist

```
Keyboard Navigation
  [ ] Tab reaches every PhaseCard header and CheckItem
  [ ] Space / Enter toggles checkbox; does NOT submit a form
  [ ] Escape closes any open snackbar
  [ ] Arrow keys navigate between CheckItems within an open phase (roving tabindex)

ARIA
  [ ] aria-checked reflects live toggle state (check with screen reader + axe)
  [ ] aria-live region announces "Marked as done" / "Marked as unread"
  [ ] Progress bar aria-valuenow updates on every toggle

Color Contrast
  [ ] Active item text: ≥ 4.5:1 on card background (WCAG AA)
  [ ] Done item text: ≥ 3.5:1 on dimmed card (WCAG AA Large)
  [ ] Checked icon: ≥ 3:1 against background

Mobile Responsiveness
  [ ] 320 px viewport: single-column, no horizontal scroll
  [ ] 768 px: two-column phase grid
  [ ] Touch target: ≥ 44 × 44 px per CheckItem

Persistence
  [ ] Toggle → reload → state preserved in localStorage
  [ ] localStorage full: error caught, fallback to in-memory, toast shown
  [ ] Sync stub: console.log fires on each change when sync enabled

Fallback
  [ ] backdrop-filter disabled in devtools: card shows solid fallback bg
  [ ] JS disabled: <noscript> static HTML renders with <details> elements
```

---

## 8. Production Optimisation Notes

- **Code split** by phase via `React.lazy` + `Suspense` for Phase 4+ (heaviest content).
- **Service Worker** (Workbox) caches the static parse output — app works fully offline.
- **`<details>/<summary>` progressive enhancement** — noscript wrapper provides a navigable fallback.
- Replace fog animation `radial-gradient` with a lightweight **Lottie JSON** (< 8 KB) for richer motion without canvas / WebGL overhead.
- For WebGL fog on hero section only, Three.js `ShaderMaterial` with `PointsMaterial` is the highest-fidelity option; restrict to desktop high-DPI screens via media query.
