# Agent Handoff: Morning Changes

Last updated: 2026-07-02

## Product identity and operating rules

Morning Changes is Justin's guitar practice workspace. Preserve the existing visual identity. The user does not want generic dashboards, filler copy, broad redesigns, temporary fixes, or hand-coded music data.

Be candid. Do not claim deployment or runtime proof you do not have. Green checks normally mean merge and deploy unless the user explicitly says to hold.

Every significant update refreshes README, `docs/WORK_ORDER.md`, and this file. Every release message must include a concrete `Look for:` cue and the expected `Live build · <short commit>` footer value. See `docs/RELEASE_VERIFICATION.md`.

## Active app scope

The active app has four spaces: Home, Fretboard, After Hours, and Tools.

Home is only a gateway. Retired routes redirect Home:

- `#/learn`
- `#/lesson/*`
- `#/practice/*`
- `#/profile`
- `#/progress`

Do not recreate legacy lessons, paths, daily licks, exercises, practice extras, premium prompts, or lesson progress without a fresh rebuild order.

## After Hours

Any `/after-hours` route has a distinct wordmark state:

- `.after-hours-wordmark-mark` is a solid black circle with a white ring.
- It keeps the normal wordmark mark's 37px footprint and must remain black in every theme, including Light and Student.
- Main label is `After Hours`.
- Subtitle is `Standards Library`.

This is a route state, not a parallel app shell.

Active standards:

- Autumn Leaves: full written form available to the focused selector at frets 7–11. Derive options from `study.form`; never recreate a manually maintained ii–V–I subset.
- 12-Bar Blues: Texas Flood, Crossroads, and The Thrill Is Gone variants.

After Hours is an authored setting. Its chord selector must remain restricted to the chords of the selected standard. Never expose the free-form Fretboard builder inside it.

## Source map

- `apps/web/src/App.tsx`
  - Core routes, real Blues route, standards shelf, and main Fretboard props.
- `apps/web/src/FretboardChordBuilder.tsx`
  - Main-Fretboard-only typed and interval-button chord builder. Includes core tones, extensions, and Sus2/Sus4 presets.
- `apps/web/src/AfterHoursFretboardCustomizer.tsx`
  - One shared renderer for full-neck and standard applications. Owns the Study Key boxed display, primary controls, More options, optional pre-control content, authored selector hiding, and English detail copy.
- `apps/web/src/AfterHoursAutumnPortBody.tsx`
  - Uses the actual unique chords from `study.form` for the focused Autumn Leaves selector.
- `apps/web/src/AfterHoursBluesApp.tsx`
  - The three Blues variants.
- `apps/web/src/after-hours-wordmark.css`
  - Theme-safe solid black ringed After Hours mark.
- `apps/web/src/fretboard-key-hierarchy.css`
  - Shared Study Key card hierarchy inside the Fretboard surface.
- `apps/web/src/fretboard-controls.css`
  - Primary three-toggle row plus native More options disclosure.
- `apps/web/src/fretboard-builder.css`
  - Additive responsive builder styling for core tones, extensions, and suspended presets.
- `apps/web/src/lib/music/intervals.ts`
  - Typed formulas for add9–13, dominant 9–13, major 9–13, and minor 9–13.
- `apps/web/src/lib/music/harmony.ts`
  - Typed symbol parsing for add, sus, and extended chord qualities.
- `apps/web/src/lib/music/layers.ts`
  - Shared marker membership includes spelled note, interval, string/fret, role, layer, and variant.
- `apps/web/scripts/fretboard-smoke.sh`
  - Browser checks for Home, Fretboard, Autumn Leaves, and Blues.

## Shared Fretboard architecture

Use `AfterHoursFretboardCustomizer`; never build a lesson-local static fretboard or parallel chord chart.

For a standard/lesson application:

```ts
fretRange={{ start: 7, end: 11 }}
compact
expandHref="#/fretboard"
chords={uniqueChordsFromTheWrittenForm}
defaultLayers={{ pentatonic: false, triad: false, arpeggio: true }}
```

For the main Fretboard:

```tsx
showChordSelector={false}
studyKeyControls={<StudyKeyControls ... />}
beforeControls={<FretboardChordBuilder ... />}
```

The Study Key is not a separate page-level panel. It lives in the renderer header beside the Shapes and Voicings copy, using the same boxed eyebrow / large-key hierarchy at a compact size. Do not create an unrelated badge or overlay to imitate it.

The primary layer row is deliberately only:

1. Pentatonic: five connected boxes.
2. Arpeggio: all active chord tones.
3. Chord: one playable generated voicing. Default to Shell because it remains useful on extended chords.

Put Triads, CAGED, Scale, Triad inversion, and Chord voicing in the native `More options` disclosure. Do not put these back in the primary row.

Scale is context, not a dedicated two-octave path. The full-neck link does not yet preserve compact-map configuration. Do not claim either is implemented.

## Engine expectations

- `buildCustomChord` is the only interval-button builder path. It requires root `1`, spells every selected interval, and creates a readable chord label.
- `parseChordSymbol` supports foundational chord qualities plus `9`, `11`, `13`, `maj9–13`, `m9–13`, `add9–13`, `sus`, `sus2`, and `sus4`.
- Extended quality formulas belong in `intervals.ts`; do not parse an extended string into a page-local note list.
- Extended Chord voicings default to Shell; Closed and Drop 2 only resolve when the chord’s voice count is supported.
- Every marker must carry engine-derived note, interval, string/fret, role, and layer membership.
- Detail copy uses that data to explain what a selected marker is and where its nearest root lies.
- Error boundaries contain route crashes; they do not replace source fixes.

## Validation

Minimum checks:

```bash
cd apps/web
npm run check
npm run music:contract
npm run build
```

Browser smoke requires:

- Home: core content and no legacy daily/path language.
- Fretboard: unified in-surface Study Key controls, no standalone `interval-panel`, extension and Sus controls, primary Pentatonic/Arpeggio/Chord row, More options, English-detail guidance, footer, and no error boundary.
- Autumn Leaves: After Hours mark, whole-form selector including the half-diminished, borrowed dominant, and minor-seven chords, plus More options.
- Blues: real Blues route plus all three variants and footer.

Failure artifacts include Home, Fretboard, Autumn Leaves, Blues DOM captures, and preview logs.

## Next work

1. Verify the deployed extension builder, primary controls, and whole-form Autumn selector on desktop and mobile.
2. Add a true two-octave scale-path generator and contract coverage.
3. Carry compact-map state to the full-neck URL.
4. Add ii–V–I voice-leading paths.
5. Add another standard only with a concrete practice outcome.
6. Rebuild Learn later from a new work order—not retired content.
