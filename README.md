# Morning Changes

Morning Changes is now a deliberately small guitar workspace centered on real standards and a shared music engine.

## Active product

The active app is a Vite + React project in `apps/web` with four core spaces:

- Home: gateway to the active workspace.
- Fretboard: shared full-neck exploration and voicing surface.
- After Hours: standards library.
- Tools: metronome.

The only active standard currently is Autumn Leaves. It uses the same shared Fretboard renderer for a focused ii–V–I study in frets 7–11.

The old lesson library, learning paths, daily lesson rotation, licks, exercises, practice extras, and lesson-progress profile have been removed. Retired routes redirect to Home until a new Learn rebuild is explicitly scoped.

## After Hours identity

Any After Hours route flips the existing wordmark 180 degrees and changes the copy to:

```text
After Hours
Standards Library
```

## Release verification

Every Pages build stamps the exact commit into a persistent footer:

```text
Live build · <short commit>
```

Use this footer as the source of truth for what is actually deployed in the browser. Every release update must also name a concrete visible behavior to look for. See `docs/RELEASE_VERIFICATION.md`.

## Fretboard architecture

The shared music engine owns all marker data: note, interval, string/fret, role, and layer.

The Fretboard supports full or focused ranges with CAGED, minor pentatonic, chord-tone/arpeggio, scale context, triads/inversions, Shell, and Drop 2 voicings. Compact standard studies reuse `AfterHoursFretboardCustomizer`; no separate local chord-chart system should be built.

A dedicated two-octave scale-path generator is not yet implemented. The existing Scale layer is range-aware context, not a named two-octave route.

## Commands

Run from `apps/web`:

```bash
npm install --no-audit --no-fund
npm run check
npm run music:contract
npm run build
npm run quality
npm run preview
```

GitHub Actions runs TypeScript, music contracts, production build, and browser smoke coverage for Home, Fretboard, and Autumn Leaves.

## Engineering rules

- Preserve the existing visual identity unless design work is explicitly requested.
- Do not use DOM patches, temporary adapters, or UI-only fixes for engine problems.
- Keep music logic in `apps/web/src/lib/music`; Fretboard and After Hours consume it.
- Do not restore retired lesson/daily content without an explicit rebuild work order.
- Keep README, `docs/WORK_ORDER.md`, and `docs/AGENT_HANDOFF.md` current after significant work.
- Green checks normally mean merge and deploy unless explicitly held.
