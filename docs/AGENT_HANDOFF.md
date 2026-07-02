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
  - The one shared map renderer for the native Fretboard route and embedded standard/lesson applications. Supports full or focused ranges, compact surface, deep-link handoff, active chords, Triads, Shells, Drop 2, and the map layers.
- `apps/web/src/AfterHoursAutumnPortBody.tsx`
  - First focused-map composition: Autumn Leaves relative-major ii–V–I around 8th position (frets 7–11).
- `apps/web/src/fretboard-focus.css`
  - Focused-map layout and responsive grid overrides. Keep it additive; do not rework existing visual language.
- `apps/web/src/lib/music/harmony.ts`
  - Chord construction, correctly spelled three-note chord construction, and chord-to-triad reduction.
- `apps/web/src/lib/music/voicings.ts`
  - Closed/drop-2/shell voice order, triad inversions, and real guitar placement across requested strings/ranges.
- `apps/web/src/lib/music/layers.ts`
  - Layer membership resolution, including `triad` and `voicing`. Renderer input must be complete.
- `apps/web/src/lib/music/shapes.ts`
  - Authoritative CAGED and minor-pentatonic parent geometry. Treat changes here as music-engine changes requiring contract/browser validation.
- `apps/web/src/lib/music/contract.ts`
  - Dependency-free contract checks for spelling, geometry, voicing, triads, and layer behavior.
- `apps/web/scripts/fretboard-smoke.sh`
  - Builds, previews, and opens both `/#/fretboard` and `/#/after-hours/autumn-leaves` in headless Chromium.
- `.github/workflows/quality.yml`
  - Maintained quality gate: TypeScript diagnostics, contract, build, and browser smoke.
- `.github/workflows/web-quality.yml`
  - Legacy verifier aligned to Node 22 and the same install strategy; do not let it drift into an unrelated red check.
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

## Focused fretboard architecture

Do not build a second “lesson fretboard” or hand-coded chord chart. Use `AfterHoursFretboardCustomizer`.

Relevant renderer props:

```ts
fretRange={{ start: 7, end: 11 }}
compact
expandHref="#/fretboard"
chords={[{ chord, scaleMode }]}
defaultLayers={{ triad: true, arpeggio: true }}
```

The same component handles:

- Active-chord selection for a progression.
- CAGED, pentatonic, Triads/inversions, arpeggio, and scale context.
- Chord voicing selector: Off, Shell, Drop 2.
- Neck range filtering and responsive compact rendering.
- Detail panels and collision priority through `resolveLayerCells`.

At present `expandHref` moves the user to the full Fretboard route but does not preserve the compact configuration in URL state. Do not claim that it does. A configuration-carrying URL is a planned next step.

Likewise, Scale is range-aware context, not a dedicated two-octave scale-path generator. Do not label it a two-octave path until the engine supports one explicitly.

## Engine architecture: triads and voicings

Three-note chord logic belongs in the main engine. Do not create Fretboard-local note arrays.

Current engine behavior:

- `buildTriad(root, quality)` handles major, minor, diminished, and augmented quality with correct spelling.
- `triadForChord(chord)` derives a tertian triad from supported major/minor/dominant/seventh/diminished/augmented chords; suspended chords intentionally do not reduce to a triad.
- `generateTriadInversion(triad, 0 | 1 | 2)` returns root, first, or second inversion in low-to-high voice order.
- `findGuitarTriadVoicings` finds playable closed-position shapes on standard contiguous three-string sets.
- `generateVoicing` plus `selectGuitarVoicingCandidate` chooses Shell or Drop 2 candidates in the current focused range.
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
- Uses headless Chromium to dump `/#/fretboard` and `/#/after-hours/autumn-leaves` DOM.
- Requires full-map Triads, inversion, chord-voicing, and Drop 2 controls.
- Requires the Autumn Leaves application eyebrow, 8th-position title, focused-range aria label, full-neck link, and chord-voicing control.
- Fails if either route reaches `This screen could not load.`.
- Uploads both DOM captures and preview logs on failure.

TypeScript diagnostics are also uploaded as an artifact whenever the TypeScript step runs.

## How to approach the next feature

Do the smallest useful engine-backed extension next.

Recommended next work:

1. Add explicit two-octave scale-path generation and contract coverage.
2. Encode focused-map settings in the full Fretboard URL so `Open full neck` preserves range, active chord, layers, inversion, and voicing setting.
3. Add voice-leading paths between selectable ii–V–I voicings.
4. Reuse focused map composition selectively in another standard or future Learn material.

## Common pitfalls

- A passing build does not prove route mount.
- A route boundary prevents black screens but does not fix bad engine data.
- Shape geometry mistakes can show up as runtime crashes because generators validate pitch class against the declared interval.
- Stale PWA caches can complicate live behavior, but do not assume cache is the root cause when engine/runtime tests fail.
- Avoid adding visual or product complexity to compensate for missing engine capability.
- Do not let Fretboard knowledge fork away from the engine; After Hours should be able to reuse it.
- Do not describe a scale context overlay as a true two-octave path without explicit engine output.

## Documentation maintenance

When a significant change lands, update this document and `docs/WORK_ORDER.md`. The README should stay accurate for the current architecture and workflow.
