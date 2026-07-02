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

The Fretboard route is a native React route and mounts the shared `AfterHoursFretboardCustomizer` directly with engine-derived data. It is not a lesson bridge or DOM adapter.

### Runtime containment and browser gate

A permanent app-level error boundary exists so one failed route cannot black-screen the app. It is containment only, never the primary fix.

The GitHub Actions quality workflow builds the app, opens `/#/fretboard` in headless Chromium, requires the shared renderer and controls to exist, and fails if the error boundary is reached. Runtime capture artifacts are uploaded on failure.

### Music-engine hardening

- The layer resolver rejects undefined memberships before render.
- Minor-pentatonic parent geometry is corrected for standard tuning’s string offsets.
- All fretboard markers must be engine-derived and complete enough to include note, interval, string/fret, role, and layer membership.

### Triad engine and Fretboard layer

Triads are now a first-class shared music-engine capability, not a Fretboard-only note table.

The engine now provides:

- Major, minor, diminished, and augmented three-note chord construction with correct spelling.
- Chord-to-triad reduction for supported seventh chords.
- Root-position, first-inversion, and second-inversion voice order.
- Playable closed-position guitar candidates across contiguous three-string sets.
- Typed layer membership for real string/fret/interval/role data.

The shared Fretboard exposes this through:

- A `Triads` layer toggle.
- Root position, first inversion, and second inversion selector.
- Triad priority when it overlaps an active arpeggio or other layer.

Contract coverage includes triad spelling, chord reduction, inversion order, playable guitar placement, complete roles, and layer priority. The browser Fretboard smoke also requires the Triads toggle and inversion selector to render.

## Current quality gates

Before merging meaningful app/engine changes, verify:

```bash
cd apps/web
npm run check
npm run music:contract
npm run build
```

In GitHub Actions, rely on:

- Web quality: TypeScript, diagnostics artifact, music contract, production build, and Fretboard browser smoke.
- Validate production app.
- Deploy Morning Changes after merge to `main`.

## What not to do

Do not:

- Rebuild the whole app shell.
- Introduce a new visual system.
- Replace the Fretboard with a fake static fretboard.
- Hide crashes behind an error boundary and call that fixed.
- Route through legacy lessons just to get something on screen.
- Add lessons, marketing copy, dashboard cards, or filler content without instruction.
- Duplicate music theory tables in Fretboard or After Hours when the engine should own them.
- Delete source files simply because a feature is in rebuild unless the user explicitly asks.

## Next product work

The next work should stay incremental and engine-backed:

1. Confirm the deployed Triads layer manually on desktop and mobile.
2. Improve focused chord-tone/arpeggio configurations, using the same voice/position model where useful.
3. Add scale context that explicitly relates the active chord to a selected scale.
4. Add shell voicings.
5. Add Drop 2 voicings.
6. Add voice-leading paths.
7. Tie After Hours standards and Fretboard configurations to the same shared engine.

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
