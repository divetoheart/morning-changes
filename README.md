# Morning Changes

Morning Changes is a visual, theory-grounded guitar practice workspace. The live app keeps its existing shell and includes Home, Learn (intentional rebuild state), After Hours, Fretboard, Tools, and Profile.

## Current architecture

- Vite + React app in `apps/web`.
- GitHub Pages deploys from `main`.
- `#/fretboard` is a native React route using the shared full-neck renderer and `lib/music` engine.
- `#/paths` redirects to Fretboard; `#/progress` redirects to Profile.

## Fretboard status

The shared music engine owns the theory and geometry behind every visible marker.

- CAGED, minor-pentatonic, chord-tone/arpeggio, scale, root, and triad layers use engine-derived note, interval, string/fret, role, and layer data.
- The engine supports correctly spelled major, minor, diminished, and augmented triads; reduction from supported chord qualities; root/first/second inversion voice order; and playable closed-position candidates on contiguous three-string sets.
- The shared Fretboard exposes Triads through its existing controls: layer toggle plus inversion selector.
- A headless Chromium smoke test builds the app and opens `#/fretboard`; it requires the renderer, Triads controls, and no error-boundary fallback.

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

GitHub Actions runs TypeScript, the music contract, production build, and the browser Fretboard smoke. It uploads diagnostics on TypeScript or browser failures.

## Engineering rules

- Do not change design, product content, Home, After Hours, Tools, or the app shell unless explicitly asked.
- Do not use DOM patches, temporary adapters, or UI-only fixes for engine problems.
- An error boundary contains route crashes; it does not replace the source-level fix.
- Keep music knowledge in `apps/web/src/lib/music`; Fretboard and After Hours consume it.
- Update `docs/WORK_ORDER.md` and `docs/AGENT_HANDOFF.md` after significant changes.
- Green checks normally mean merge and deploy unless explicitly held.

## Next direction

Triads are complete. Next: focused chord-tone/arpeggio configurations, then scale context, shell voicings, Drop 2, and voice-leading paths.
