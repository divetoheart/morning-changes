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

- `/fretboard` is a native React route using the shared fretboard renderer.
- `/paths` redirects to `/fretboard`.
- `/progress` redirects to `/profile`.
- Learn is intentionally in rebuild state.

Do not bring back the old Paths lesson flow as a primary navigation item unless the user explicitly asks.

## Current completed work

### Native shared Fretboard

`AfterHoursFretboardCustomizer` is the only fretboard surface for both full-neck exploration and embedded study applications. It is native React with engine-derived data, not a lesson bridge, DOM adapter, or separate diagram system.

The renderer accepts:

- A full neck or a specified `fretRange`.
- `compact` presentation for an embedded practice surface.
- An optional `expandHref` for a small handoff to the full Fretboard route.
- A typed active chord list, so the same view can follow a progression instead of a single harmony.

### Focused progression application

Autumn Leaves now demonstrates the intended reuse pattern:

- Relative-major ii–V–I from the selected arrangement.
- Focused frets 7–11, described as 8th position.
- Active chord selector through ii, V, and I.
- Same CAGED, pentatonic, Triads/inversions, arpeggio, scale, Shell, and Drop 2 controls as the full Fretboard.
- Subtle `Open full neck` handoff.

Future lessons and standards should compose this same component with range and chord props. Do not build special local chord-chart tables to replicate it.

### Music-engine hardening and voicings

- The layer resolver rejects undefined memberships before render.
- Minor-pentatonic parent geometry is corrected for standard tuning’s string offsets.
- All fretboard markers must be engine-derived and complete enough to include note, interval, string/fret, role, and layer membership.
- Triads are typed, correctly spelled, reducible from supported chord qualities, and placeable as playable closed-position guitar candidates.
- Shell and Drop 2 options use the existing shared voicing engine and select a playable candidate inside the current focused range.

### Runtime containment and browser gate

A permanent app-level error boundary exists so one failed route cannot black-screen the app. It is containment only, never the primary fix.

Browser smoke now validates both:

1. `/#/fretboard`: renderer, Triads, inversion selector, chord-voicing selector, Drop 2 option, and no error boundary.
2. `/#/after-hours/autumn-leaves`: focused application eyebrow/title, focused neck range, full-neck handoff, shared voicing selector, and no error boundary.

Runtime capture uploads both rendered DOM pages and preview logs on failure.

### CI consistency

Both Web quality workflows use Node 22 and the same deterministic install path. Do not let the legacy verifier silently diverge from the maintained quality gate.

## Current quality gates

Before merging meaningful app/engine changes, verify:

```bash
cd apps/web
npm run check
npm run music:contract
npm run build
```

In GitHub Actions, rely on:

- Maintained Web quality: TypeScript, diagnostics artifact, music contract, production build, and both-route browser smoke.
- Web verifier: Node 22 install plus `npm run quality`.
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
- Create a new diagram component for a compact study when `fretRange` and `compact` can express it.
- Delete source files simply because a feature is in rebuild unless the user explicitly asks.

## Next product work

The next work should stay incremental and engine-backed:

1. Confirm the deployed full and Autumn Leaves focused maps manually on desktop and mobile.
2. Add a true two-octave scale-path generator; current Scale is context, not a specific two-octave route.
3. Add configuration-carrying links so `Open full neck` preserves the compact study’s active chord, range, and active controls.
4. Add voice-leading paths between selected ii–V–I voicings.
5. Reuse focused maps in another standard or future Learn lesson only when the practice outcome calls for it.

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
