# Morning Changes

Morning Changes is a visual, theory-grounded guitar practice workspace. The live app keeps its existing shell and includes Home, Learn (intentional rebuild state), After Hours, Fretboard, Tools, and Profile.

## Current architecture

- Vite + React app in `apps/web`.
- GitHub Pages deploys from `main`.
- `#/fretboard` is a native React route using the shared full-neck renderer and `lib/music` engine.
- `#/paths` redirects to Fretboard; `#/progress` redirects to Profile.

## Release verification

Every Pages build stamps the exact GitHub commit into a persistent footer:

```text
Live build · <short commit>
```

Use that footer as the source of truth for the site currently in your browser. It links to the full commit. Each release update should also name one concrete visual behavior to look for, not only a merge SHA. See `docs/RELEASE_VERIFICATION.md`.

## Fretboard status

The shared music engine owns the theory and geometry behind every visible marker.

- CAGED, minor-pentatonic, chord-tone/arpeggio, scale, root, triad, and chord-voicing markers use engine-derived note, interval, string/fret, role, and layer data.
- The engine supports correctly spelled major, minor, diminished, and augmented triads; reduction from supported chord qualities; root/first/second inversion voice order; closed-position candidates; shell voicings; and Drop 2 candidates.
- The shared Fretboard is range-aware. A screen can render the complete neck or a compact playable window without maintaining a separate diagram system.
- Compact maps can retain the same active-chord, Triads, inversion, CAGED, pentatonic, arpeggio, scale, Shell, and Drop 2 controls, with a small `Open full neck` handoff.
- Autumn Leaves is the first applied configuration: a relative-major ii–V–I in frets 7–11, built from the same map and engine as the full Fretboard.
- A headless Chromium smoke test opens both `#/fretboard` and `#/after-hours/autumn-leaves`; it requires the renderer, key controls, focused range, expand link, visible build footer, and no error-boundary fallback.

A dedicated two-octave scale-path generator is not yet a separate map mode. The existing Scale layer is range-aware context; true two-octave routes are future engine work.

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

GitHub Actions runs TypeScript, the music contract, production build, and browser smoke coverage. It uploads diagnostics on TypeScript or browser failures.

## Engineering rules

- Do not change design, product content, Home, After Hours, Tools, or the app shell unless explicitly asked.
- Do not use DOM patches, temporary adapters, or UI-only fixes for engine problems.
- An error boundary contains route crashes; it does not replace the source-level fix.
- Keep music knowledge in `apps/web/src/lib/music`; Fretboard and After Hours consume it.
- Focused lesson/study maps must use `AfterHoursFretboardCustomizer` with structured props, not parallel local diagrams.
- Update `docs/WORK_ORDER.md` and `docs/AGENT_HANDOFF.md` after significant changes.
- Green checks normally mean merge and deploy unless explicitly held.
- Release communication must include a concrete “Look for” cue and the visible footer SHA.

## Next direction

The first focused ii–V–I study is complete. Next: a true two-octave scale-path generator, configuration-carrying full-neck links, then voice-leading paths across applied standards.
