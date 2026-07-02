# Morning Changes Work Order

Last updated: 2026-07-02

## Non-negotiable product constraints

1. Do not redesign Morning Changes unless explicitly asked.
2. Do not change app content unless explicitly asked.
3. Do not take shortcuts, use DOM adapters, or ship temporary wrappers as fixes.
4. Preserve the existing visual identity, layout language, and product feel.
5. Always fix the actual source path that is broken.
6. Always update repo documentation after significant app, engine, workflow, or deployment changes when warranted.
7. This repo is a live test environment. When checks are green, merge and deploy by default unless the user explicitly asks to hold.

## Current navigation / product shell

The intended active navigation is:

- Home
- Learn
- After Hours
- Fretboard
- Tools
- Profile

Current route behavior:

- `/fretboard` is a native React route using the shared full-neck fretboard renderer.
- `/paths` redirects to `/fretboard`.
- `/progress` redirects to `/profile`.
- Learn is intentionally in rebuild state.

Do not bring back the old Paths lesson flow as a primary navigation item unless the user explicitly asks.

## Current completed work

### Native Fretboard route

The Fretboard route has been moved away from the prior fragile lesson/DOM bridge path. The current route mounts the shared `AfterHoursFretboardCustomizer` directly through React with engine-derived data.

The default route currently uses a selected study key and a major-7 chord context while exposing the shared layered map.

### Runtime containment

A permanent app-level error boundary exists. Its job is containment only: one route should never black-screen the whole app. It is not a substitute for source-level fixes.

### Music-engine hardening

The shared layer resolver now rejects undefined memberships before render. Renderer input must be complete enough to include location, interval, role, and layer.

### Pentatonic geometry fix

The Fretboard blank-screen bug was traced to incorrect minor-pentatonic parent geometry in standard tuning:

- Box 2: G-string fifth coordinate was one fret too high.
- Box 5: A-string flat-third coordinate was one fret too low.

These are engine/table issues, not UI issues. Future fretboard failures should be treated as source/data/engine failures first, not as CSS or boundary problems.

### Browser regression gate

The GitHub Actions quality workflow now includes `apps/web/scripts/fretboard-smoke.sh`.

That script:

1. Builds the production app.
2. Starts Vite preview.
3. Opens `/#/fretboard` in headless Chromium.
4. Fails if the Fretboard heading is missing.
5. Fails if the shared full-neck renderer is missing.
6. Fails if the app error boundary is reached.

This is the required gate for any future Fretboard change.

## Current quality gates

Before merging meaningful app/engine changes, verify:

```bash
cd apps/web
npm run check
npm run music:contract
npm run build
```

In GitHub Actions, also rely on:

- Web quality
- Fretboard route runtime smoke
- Validate production app
- Deploy Morning Changes after merge to `main`

## What not to do

Do not:

- Rebuild the whole app shell.
- Introduce a new visual system.
- Replace the Fretboard with a fake static fretboard.
- Hide crashes behind an error boundary and call that fixed.
- Route through legacy lessons just to get something on screen.
- Add lessons, marketing copy, dashboard cards, or filler content without instruction.
- Delete source files simply because a feature is in rebuild unless the user explicitly asks.

## Next product work

The next feature sequence should be incremental and engine-backed:

1. Confirm deployed Fretboard behavior manually on desktop and mobile.
2. Add a small Fretboard configuration selector without redesigning the page.
3. Start with triads.
4. Then add chord tones / arpeggios.
5. Then add scale context.
6. Then add shell voicings.
7. Then add Drop 2 voicings.
8. Then add voice-leading paths.
9. Tie After Hours standards and Fretboard configurations to the same shared engine.

Each new map/configuration needs:

- Engine-derived notes and intervals.
- Contract coverage for music correctness.
- Browser smoke coverage when route behavior changes.
- No visual redesign unless requested.

## Documentation policy

After significant changes, update:

- `README.md` for project-level truth.
- `docs/WORK_ORDER.md` for current product/engineering direction.
- `docs/AGENT_HANDOFF.md` for transition-ready implementation context.

Documentation changes should not alter the app unless explicitly requested.
