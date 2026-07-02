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
  - Shared layered full-neck renderer used by After Hours and the native Fretboard route. It now exposes the engine-backed Triads layer and inversion selector.
- `apps/web/src/lib/music/harmony.ts`
  - Chord construction, correctly spelled three-note chord construction, and chord-to-triad reduction.
- `apps/web/src/lib/music/voicings.ts`
  - Closed/drop-2/shell voice order plus triad inversions and real guitar placement across contiguous three-string sets.
- `apps/web/src/lib/music/layers.ts`
  - Layer membership resolution, including the `triad` layer. Renderer input must be complete.
- `apps/web/src/lib/music/shapes.ts`
  - Authoritative CAGED and minor-pentatonic parent geometry. Treat changes here as music-engine changes requiring contract/browser validation.
- `apps/web/src/lib/music/contract.ts`
  - Dependency-free contract checks for spelling, geometry, voicing, triads, and layer behavior.
- `apps/web/scripts/run-music-contract.mjs`
  - Bundles and runs the music contract in CI.
- `apps/web/scripts/fretboard-smoke.sh`
  - Builds, previews, and opens `/#/fretboard` in headless Chromium. Requires the renderer, Triads control, inversion selector, and no error boundary.
- `.github/workflows/quality.yml`
  - Main pull request quality gate. Includes TypeScript diagnostics artifact, music contract, production build, and Fretboard smoke.
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

## Engine architecture: three-note chords

Three-note chord logic belongs in the main engine. Do not create Fretboard-local note arrays.

Current engine behavior:

- `buildTriad(root, quality)` handles major, minor, diminished, and augmented quality with correct spelling.
- `triadForChord(chord)` derives a tertian triad from supported major/minor/dominant/seventh/diminished/augmented chords; suspended chords intentionally do not reduce to a triad.
- `generateTriadInversion(triad, 0 | 1 | 2)` returns root, first, or second inversion in low-to-high voice order.
- `findGuitarTriadVoicings` finds playable closed-position shapes on standard contiguous three-string sets.
- Fretboard uses those candidates as typed layer memberships, with real note/interval/string/fret/role data.

When extending this surface, preserve that split: engine calculates; renderer chooses what to show.

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
- Requires `Triads` and `Triad inversion` controls.
- Fails if `This screen could not load.` appears.
- Uploads runtime capture artifacts on failure.

TypeScript diagnostics are also uploaded as an artifact whenever the TypeScript step runs.

## How to approach the next feature

Do the smallest useful engine-backed Fretboard feature next. Recommended next step: focused chord-tone/arpeggio configurations.

The existing arpeggio layer has chord tones across the neck. The next pass should make its practice value more intentional without duplicating triad or voicing logic:

- Keep data in `lib/music`.
- Decide whether the user needs a voicing/path view, a narrower region view, or an interval emphasis mode before changing UI.
- Reuse the same typed position model and layer resolver.
- Add contract coverage for any new generator or selection rule.
- Extend browser smoke when the route exposes new controls.

Likely future sequence:

1. Focused chord tones / arpeggios.
2. Scale context.
3. Shell voicings.
4. Drop 2 voicings.
5. Voice-leading paths.
6. Standards-specific Fretboard configurations fed by the same engine.

## Common pitfalls

- A passing build does not prove route mount.
- A route boundary prevents black screens but does not fix bad engine data.
- Shape geometry mistakes can show up as runtime crashes because generators validate pitch class against the declared interval.
- Stale PWA caches can complicate live behavior, but do not assume cache is the root cause when engine/runtime tests fail.
- Avoid adding visual or product complexity to compensate for missing engine capability.
- Do not let Fretboard knowledge fork away from the engine; After Hours should be able to reuse it.

## Documentation maintenance

When a significant change lands, update this document and `docs/WORK_ORDER.md`. The README should stay accurate for the current architecture and workflow.
