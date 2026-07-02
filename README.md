# Morning Changes

Morning Changes is a guitar practice workspace for visual, theory-grounded study. The current product centers on a preserved app shell with these live spaces:

- Home
- Learn, currently an intentional rebuild state
- After Hours
- Fretboard
- Tools
- Profile

The project is deployed through GitHub Pages from `main`. This repository is a live test environment, so once checks are green, changes are normally merged and deployed unless explicitly held.

## Current status

The active app is a Vite + React application in `apps/web`.

The major recent stabilization work was the native Fretboard route:

- `/fretboard` is a real React route, not a DOM adapter or lesson bridge.
- `/paths` redirects to `/fretboard`.
- `/progress` redirects to `/profile`.
- The shared music engine now validates fretboard-layer memberships before render.
- The minor-pentatonic parent geometry was corrected for the standard-tuning G/B string offset.
- CI now includes a headless Chromium smoke test that builds the app, opens `#/fretboard`, and fails if the full-neck renderer is missing or the app error boundary is reached.

## Development commands

From `apps/web`:

```bash
npm install --no-audit --no-fund
npm run check
npm run music:contract
npm run build
npm run quality
npm run preview
```

`npm run quality` currently runs TypeScript, the music-engine contract, and the production build. The GitHub Actions quality workflow additionally runs the browser Fretboard route smoke test via `scripts/fretboard-smoke.sh`.

## Repository layout

```text
apps/web/                    Vite + React app
apps/web/src/App.tsx         Main app shell, navigation, and routes
apps/web/src/lib/music/      Shared music theory, geometry, voicing, layer, and contract engine
apps/web/src/AfterHours*     After Hours study surfaces and shared fretboard renderer usage
apps/web/scripts/            CI/helper scripts, including music contract and Fretboard smoke
.github/workflows/quality.yml Pull request and main quality gate
.github/workflows/deploy.yml  GitHub Pages deployment
standards/                   Static standard-specific companion material
```

## Engineering rules

- Do not redesign the app shell, visual identity, navigation treatment, Home, After Hours, Tools, or existing content unless explicitly asked.
- Do not implement temporary fixes, DOM patches, or adapter bridges when a source-level fix is required.
- Do not hide route crashes as the only fix. The error boundary is permanent containment, not a substitute for repairing the broken data path.
- Every fretboard marker must come from real engine data: note, interval, fret/string location, role, and layer membership.
- Shape tables are authoritative only when backed by engine contract coverage and browser route coverage.
- Significant app or engine changes should update `docs/WORK_ORDER.md` and `docs/AGENT_HANDOFF.md` in the same PR or immediately after.
- Keep source, tests, and docs aligned before deployment.

## Deployment

Merging to `main` triggers GitHub Pages deployment. Treat this as the live test site, not a separate production release process.

Default workflow for future agents:

1. Make the smallest source-level change that satisfies the work order.
2. Run or wait for TypeScript, music contract, production build, and relevant browser smoke checks.
3. Merge and deploy when green unless the user says to hold.
4. Update docs after significant changes.

## Product direction

Near-term direction is to make Fretboard useful as a serious practice surface without changing the site design:

1. Stabilize the current Fretboard route and keep browser coverage green.
2. Add focused Fretboard configurations one at a time.
3. Start with triads, then chord tones/arpeggios, scale context, shell voicings, Drop 2, and voice-leading paths.
4. Keep After Hours standards and Fretboard on the same shared music engine.
