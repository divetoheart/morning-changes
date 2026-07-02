# Agent Handoff: Morning Changes

Last updated: 2026-07-02

## Product identity

Morning Changes is Justin's guitar practice workspace. Preserve the existing visual identity. The user does not want generic dashboards, filler copy, broad redesigns, temporary fixes, or hand-coded music data.

Be candid. Do not claim deployment or runtime proof that you do not have. Green checks normally mean merge and deploy unless the user explicitly says to hold.

Every significant update should refresh README, `docs/WORK_ORDER.md`, and this file. Every release message must include a concrete visible `Look for:` cue and the expected `Live build · <short commit>` footer value. See `docs/RELEASE_VERIFICATION.md`.

## Active app scope

The app is intentionally reduced to four core spaces:

- Home
- Fretboard
- After Hours
- Tools

Home is a simple gateway to those spaces.

The old Learn/lesson/path/daily/profile ecosystem is retired. The following route families redirect to Home:

- `#/learn`
- `#/lesson/*`
- `#/practice/*`
- `#/profile`
- `#/progress`

Do not recreate legacy lessons, paths, daily licks, daily exercises, practice extras, premium prompts, or lesson progress unless the user explicitly starts a fresh rebuild effort.

## After Hours route state

Any path beginning `/after-hours` changes the shared wordmark state:

- Existing mark rotates 180 degrees through `.after-hours-wordmark-mark`.
- Main label reads `After Hours`.
- Subtitle reads `Standards Library`.

This is deliberately a route state, not an alternative app shell.

## Source map

- `apps/web/src/App.tsx`
  - Minimal route shell, core navigation, After Hours wordmark state, and core screens.
- `apps/web/src/after-hours-wordmark.css`
  - Small additive wordmark state styling.
- `apps/web/src/AfterHoursFretboardCustomizer.tsx`
  - One shared map renderer for full-neck and embedded standard applications.
- `apps/web/src/AfterHoursAutumnPortBody.tsx`
  - First focused composition: Autumn Leaves relative-major ii–V–I around 8th position / frets 7–11.
- `apps/web/src/lib/music/`
  - Canonical engine for pitch, harmony, fretboard geometry, layers, triads, and voicings.
- `apps/web/scripts/fretboard-smoke.sh`
  - Browser smoke for Home, Fretboard, and Autumn Leaves.
- `.github/workflows/quality.yml`
  - TypeScript, contract, production build, and browser smoke with runtime capture.
- `.github/workflows/deploy.yml`
  - GitHub Pages build; injects commit metadata shown by the visible footer.

## Shared Fretboard architecture

Use `AfterHoursFretboardCustomizer`, never a lesson-local fretboard or static chord chart.

Relevant props:

```ts
fretRange={{ start: 7, end: 11 }}
compact
expandHref="#/fretboard"
chords={[{ chord, scaleMode }]}
defaultLayers={{ triad: true, arpeggio: true }}
```

It supports active-chord selection, CAGED, pentatonic, Triads/inversions, arpeggio, scale context, Shell, Drop 2, collision detail, and focused ranges.

The full-neck link does not yet preserve the compact map’s configuration. Scale is context, not a dedicated two-octave path. Do not claim either is implemented.

## Engine expectations

- `buildTriad`, `triadForChord`, `generateTriadInversion`, and `findGuitarTriadVoicings` belong to the shared engine.
- Shell and Drop 2 candidates come from `generateVoicing` and `selectGuitarVoicingCandidate`.
- Every marker must have engine-derived note, interval, string/fret, role, and layer membership.
- The layer resolver rejects undefined memberships. An error boundary is containment, never a replacement for fixing source data.

## Validation

Minimum checks:

```bash
cd apps/web
npm run check
npm run music:contract
npm run build
```

Browser smoke requires:

- Home: core spaces, no legacy daily/lesson/path content, and live footer.
- Fretboard: renderer, Triads, inversion, chord-voicing, Drop 2, footer, and no error boundary.
- Autumn Leaves: After Hours wordmark state, focused map, expand link, voicing control, footer, and no error boundary.

Failure artifacts include Home, Fretboard, Autumn Leaves DOM captures and preview logs.

## Next work

1. Verify the deployed core shell and After Hours wordmark on desktop and mobile.
2. Add a true two-octave scale-path generator and contract coverage.
3. Carry compact-map state to the full-neck URL.
4. Add ii–V–I voice-leading paths.
5. Add another standard only with a concrete practice outcome.
6. Rebuild Learn later from a new work order—not from retired content.
