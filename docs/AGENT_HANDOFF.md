# Agent Handoff: Morning Changes

Last updated: 2026-07-02

This document exists so a future agent can continue work without repeating the mistakes that caused the prior rollback and Fretboard runtime failure.

## Project identity

Morning Changes is Justin's guitar practice workspace. The app has a strong existing identity. Preserve it.

The user does not want generic dashboards, filler copy, or broad redesigns. The site should feel like the same product unless the user specifically asks for design work.

## User preferences / operating rules

- Be candid and precise.
- Do not overpromise verification.
- Do not say something is deployed or fixed unless the relevant checks or browser behavior actually support it.
- For this repo, green checks normally mean merge and deploy. Do not stop at “ready for review” unless the user tells you to hold.
- Do not ask the user to repeat requirements already captured here.
- Do not change visual design, content structure, or product direction unless explicitly asked.
- Significant updates should be followed by documentation updates when warranted.

## Important recent history

A previous attempt overreached by redesigning the app shell when the user had asked for navigation/content scope changes. The correct response was to restore the original design and proceed with small, scoped changes only.

The Fretboard route later black-screened. Build and TypeScript passed, but browser runtime failed. The final real fix was not an error boundary or cache-only migration. The root cause was incorrect minor-pentatonic geometry in the shared music engine.

Corrected issues:

- Minor pentatonic Box 2 G-string fifth coordinate.
- Minor pentatonic Box 5 A-string flat-third coordinate.

The browser smoke test now prevents this specific class of Fretboard mount failure from passing silently.

## Current source map

Key files:

- `apps/web/src/App.tsx`
  - Main navigation, route shell, Home/Learn/Fretboard/After Hours/Tools/Profile screens.
- `apps/web/src/AfterHoursFretboardCustomizer.tsx`
  - Shared layered full-neck renderer used by After Hours and the native Fretboard route.
- `apps/web/src/lib/music/`
  - Music engine: pitch, harmony, fretboard geometry, shape generation, voicings, layers, and contract tests.
- `apps/web/src/lib/music/shapes.ts`
  - Authoritative CAGED and minor-pentatonic parent geometry. Treat changes here as music-engine changes requiring contract/browser validation.
- `apps/web/src/lib/music/layers.ts`
  - Layer membership resolution and collision handling. Renderer input must be complete.
- `apps/web/src/lib/music/contract.ts`
  - Dependency-free contract checks for spelling, geometry, voicing, and layer behavior.
- `apps/web/scripts/run-music-contract.mjs`
  - Bundles and runs the music contract in CI.
- `apps/web/scripts/fretboard-smoke.sh`
  - Builds, previews, and opens `/#/fretboard` in headless Chromium.
- `.github/workflows/quality.yml`
  - Main pull request quality gate. Includes TypeScript, music contract, production build, and Fretboard smoke.
- `.github/workflows/deploy.yml`
  - GitHub Pages deployment from `main`.

## Current active routes

- `#/` Home
- `#/learn` intentional rebuild state
- `#/after-hours` standards shelf
- `#/after-hours/autumn-leaves` current standard app
- `#/fretboard` native shared-map route
- `#/tools` metronome / planned tuner
- `#/profile` practice progress/profile

Redirects:

- `#/paths` -> `#/fretboard`
- `#/progress` -> `#/profile`

## Validation expectations

For app or engine changes, do not rely only on `npm run build`.

Minimum local checks:

```bash
cd apps/web
npm run check
npm run music:contract
npm run build
```

For Fretboard-related changes, the GitHub Actions browser smoke must pass. It is not enough for TypeScript or Vite to build.

Current browser smoke behavior:

- Builds production app.
- Serves it with Vite preview.
- Uses headless Chromium to dump `/#/fretboard` DOM.
- Requires `Explore the neck.`.
- Requires `ah-fretboard-customizer`.
- Fails if `This screen could not load.` appears.
- Uploads runtime capture artifacts on failure.

## How to approach the next feature

Do the smallest useful Fretboard feature next. Recommended next step: triads.

A good first triad pass should:

- Add a real configuration/state control to Fretboard without changing the page design language.
- Use shared engine data, not hand-coded page-local note arrays.
- Keep marker semantics explicit: note, interval, string/fret, role, layer.
- Add contract coverage for any new generator logic.
- Extend browser smoke only if new route behavior needs proof.

Likely future sequence:

1. Triads.
2. Chord tones / arpeggios.
3. Scale context.
4. Shell voicings.
5. Drop 2 voicings.
6. Voice-leading paths.
7. Standards-specific Fretboard configurations fed by the same engine.

## Common pitfalls

- A passing build does not prove route mount.
- A route boundary prevents black screens but does not fix bad engine data.
- Shape geometry mistakes can show up as runtime crashes because generators validate pitch class against the declared interval.
- Stale PWA caches can complicate live behavior, but do not assume cache is the root cause when engine/runtime tests fail.
- Avoid adding visual or product complexity to compensate for missing engine capability.

## Documentation maintenance

When a significant change lands, update this document and `docs/WORK_ORDER.md`. The README should stay accurate for the current architecture and workflow.
