# ML Roadmap Glass UI

Interactive, animated glassmorphic roadmap tracker. Two versions included:

- **`index.html`** — zero-dependency vanilla HTML/CSS/JS (open in any browser, no build step)
- **`react-app/`** — React 18 + Vite + Framer Motion (production-grade)

---

## Quick Start — Vanilla (recommended for eval)

```bash
# Just open the file directly:
open index.html
# OR serve with any static server:
npx serve .
# OR:
python3 -m http.server 8080
```

---

## Quick Start — React + Vite

```bash
cd react-app
npm install
npm run dev
# → http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output in react-app/dist/
npx serve react-app/dist
```

### Environment Variables (optional)

Create `react-app/.env.local`:
```
VITE_API_URL=https://your-api.com
```

---

## Feature Overview

| Feature | Vanilla | React |
|---|---|---|
| Glass cards | ✅ CSS | ✅ CSS + Framer Motion |
| Collapse/expand | ✅ CSS max-height | ✅ Framer layout |
| Toggle persistence | ✅ localStorage | ✅ localStorage hook |
| Server sync stub | ✅ | ✅ |
| Undo snackbar | ✅ | ✅ |
| Progress bar + ring | ✅ | ✅ |
| Roving tabindex | ✅ | ✅ |
| ARIA live region | ✅ | ✅ |
| Reduced motion | ✅ @media | ✅ useReducedMotion |
| backdrop-filter fallback | ✅ @supports | ✅ @supports |
| Intersection observer lazy | ✅ | ✅ |
| Bulk mark phase | ✅ | ✅ |

---

## Testing Checklist

### Keyboard Navigation
- [ ] `Tab` reaches every PhaseCard header
- [ ] `Enter` / `Space` on a header opens/closes it
- [ ] `Tab` into open phase reaches first CheckItem
- [ ] `Arrow Down` / `Arrow Up` navigate between items within phase
- [ ] `Space` / `Enter` on a CheckItem toggles it
- [ ] `Escape` dismisses the undo snackbar (if focused)
- [ ] Sync toggle reachable and activatable by keyboard

### ARIA Attributes
- [ ] Phase headers: `aria-expanded` reflects open state
- [ ] CheckItems: `role="checkbox"` + `aria-checked` reflects done state
- [ ] Live region announces toggle message to screen reader
- [ ] Progress bar: `role="progressbar"` + `aria-valuenow` updates on toggle
- [ ] Bulk buttons have descriptive `aria-label`

### Color Contrast (WCAG AA)
- [ ] Active item text on glass card background: ≥ 4.5:1
- [ ] Done (dimmed) item text: ≥ 3.5:1 (large text rule)
- [ ] Checkmark icon on green background: ≥ 3:1
- [ ] Phase num badge: ≥ 4.5:1

### Mobile Responsiveness
- [ ] 320 px viewport: single column, no overflow
- [ ] Touch targets ≥ 44×44 px per CheckItem row
- [ ] Progress ring hidden on mobile (non-critical)
- [ ] Phase card hover effect doesn't trigger on touch

### Persistence
- [ ] Toggle → refresh → state preserved
- [ ] Clear localStorage → all items reset
- [ ] Sync toggle → console.log fires (stub verification)

### Fallback
- [ ] Disable backdrop-filter in DevTools: card shows solid dark background
- [ ] Disable JS: static noscript HTML renders (vanilla only)

---

## Implementation Notes

### Browser Support
- Chrome 76+, Firefox 103+, Safari 14+, Edge 79+
- `backdrop-filter` requires: Chrome 76+, Safari 9+, Firefox 103+
- Fallback: `background: rgba(18,20,40,0.88)` via `@supports not (backdrop-filter: blur(1px))`

### Performance
- Each glass card creates a compositing layer (GPU) — capped at 10 visible simultaneously via IntersectionObserver
- `will-change: transform` is NOT set statically; only during active Framer animations
- Static roadmap data is parsed at module level (zero runtime cost)
- `requestAnimationFrame` used for ARIA live-region updates to batch DOM writes

### Fog Animation
- CSS `::before` pseudo-element with `radial-gradient` + `keyframes fogPulse`
- ~0 KB overhead, 60 fps via GPU compositing
- For richer fog: drop in a Lottie JSON (fog-particle.json, ~8 KB) and use `@lottiefiles/lottie-player`
- For WebGL tier: Three.js `PointsMaterial` shader on desktop only (guard with `window.matchMedia('(min-width:1024px) and (hover:hover)')`)

### Lottie Alternative
```html
<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
<lottie-player src="fog-particle.json" background="transparent" speed="0.6" loop autoplay></lottie-player>
```

### Production Optimisations
- Code-split phases 4–9 with `React.lazy` + `Suspense`
- Add Workbox service worker for offline support
- Preload fonts: `<link rel="preload" href="..." as="font">`
- Image optimisation: none needed (SVG icons only)
- Bundle analysis: `npx vite-bundle-visualizer` in react-app/

---

## UX Spec

### Read State Behaviour
- **Single click** → toggle done/unread immediately (optimistic)
- **Long-press (600 ms)** on a phase header → select all items in phase (bulk)
- **Undo snackbar** → appears 300 ms after toggle, persists 3.5 s, dismissable by click or Escape
- **Sync indicator** → spinner on top-right when sync is in-flight (stub: no spinner needed)

### Microcopy
| State | Message |
|---|---|
| Item toggled done | "✓ Marked as done" |
| Item toggled unread | "↩ Marked as unread" |
| Phase fully done | "✓ Phase marked as complete" |
| Phase cleared | "↩ Phase cleared" |
| Sync enabled | "🔄 Sync enabled — changes will push to server" |
| Storage full | "⚠️ Storage full — progress saved in memory only." |
| All phases done | "🎉 You're an AI Engineer. Ship something." |

### Timestamp format
`done 14 Mar` — locale-aware short date (en-IN for India, auto for others)
