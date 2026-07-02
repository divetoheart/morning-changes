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

- Autumn Leaves: unique chord choices and ordered chord events are derived from `study.form`; the ordered events now drive shared next-chord target tones.
- 12-Bar Blues: Texas Flood, Crossroads, and The Thrill Is Gone variants.

After Hours is an authored setting. Its chord selector must remain restricted to the chords of the selected standard. Never expose the free-form Fretboard builder inside it.

## Source map

- `apps/web/src/App.tsx`
  - Main Fretboard key/mode state and compact harmonic-motion selector: Free chord, major ii–V–I, minor iiø–V–i, dominant blues skeleton.
- `apps/web/src/FretboardChordBuilder.tsx`
  - Main-Fretboard-only typed and interval-button chord builder; includes extensions, Sus presets, practical 6/6-9/minor-major/altered-dominant guidance.
- `apps/web/src/AfterHoursFretboardCustomizer.tsx`
  - One shared renderer for full-neck and standards. Owns primary controls, More options, labels, position focus, scale context, target overlay, voice-leading panel, and English fret detail.
- `apps/web/src/AfterHoursAutumnPortBody.tsx`
  - Passes both unique selector choices and the actual ordered Autumn form to the shared renderer.
- `apps/web/src/fretboard-controls.css`
  - Primary controls, More options, target-tone and voice-leading presentation.
- `apps/web/src/fretboard-builder.css`
  - Chord-builder and harmonic-motion selector styling.
- `apps/web/src/lib/music/intervals.ts`
  - Chord formulas and scale formulas, including altered/lydian-dominant/phrygian-dominant/minor-blues contexts.
- `apps/web/src/lib/music/harmony.ts`
  - Parsing for practical chord symbols through alterations and 6/9 vocabulary.
- `apps/web/src/lib/music/voice-leading.ts`
  - Canonical ii–V, V–I, and fallback nearest-guide-tone resolution engine.
- `apps/web/src/lib/music/layers.ts`
  - Shared marker resolver including the `targets` layer.
- `apps/web/scripts/fretboard-smoke.sh`
  - Browser checks for Home, Fretboard, Autumn Leaves, and Blues.

## Shared Fretboard architecture

Use `AfterHoursFretboardCustomizer`; never build a lesson-local static fretboard or parallel chord chart.

For a course or standard application:

```tsx
<AfterHoursFretboardCustomizer
  chords={uniqueChordChoices}
  progression={orderedChordEvents}
  fretRange={{ start: 7, end: 11 }}
  compact
  defaultLayers={{ pentatonic: false, triad: false, arpeggio: true }}
/>
```

`chords` provides unique active choices. `progression` retains literal order and enables **Voice lead next** plus the optional **Targets** layer. A `FretboardChordOption` may carry an authored `scaleMode` and `functionLabel`.

The Study Key remains a compact in-surface hierarchy beside the shared Fretboard heading. Do not create separate panels, overlays, or a second Fretboard component.

Primary controls are deliberately only:

1. Pentatonic: five connected boxes.
2. Arpeggio: active chord tones.
3. Chord: one playable generated voicing, Shell by default.

More options own Targets, Triads, CAGED, Scale, Scale context, marker labels, neck position, inversion, and voicing. Keep the primary row short.

## Engine expectations

- `buildCustomChord` is the only interval-button builder path. It requires root `1`, spells every selected interval, and creates a readable chord label.
- `parseChordSymbol` supports foundational forms, `6`, `m6`, `6/9`, `mMaj7`, `7sus4`, `7♭9`, `7♯9`, `7♯11`, `7♭13`, 9/11/13, maj/minor extensions, adds, and sus chords.
- `voice-leading.ts` owns guide-tone resolutions. It must be used by standard/course progression data; do not hard-code target notes in UI.
- For ii–V, the minor third holds as the dominant seventh while the minor seventh resolves to the dominant third. For V–I, the dominant third resolves to the tonic and its flat seventh resolves to the target third.
- The Targets overlay identifies target intervals in the *next* chord and is intentionally opt-in under More options.
- Every marker must carry engine-derived note, interval, string/fret, role, and layer membership.
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
- Fretboard: Study Key hierarchy, harmonic-motion selector, practical builder, primary controls, More options, scale/labels/position/targets controls, footer, and no error boundary.
- Autumn Leaves: After Hours mark, whole-form selector, voice-leading panel, and no error boundary.
- Blues: real Blues route plus all three variants and footer.

Failure artifacts include Home, Fretboard, Autumn Leaves, Blues DOM captures, and preview logs.

## Next work

1. Author the first actual courses and new standards using `chords` + `progression` instead of one-off Fretboard code.
2. Add a true two-octave scale-path generator only when a course needs one.
3. Carry compact-map state to the full-neck URL.
4. Add rhythmic comping/backing support only tied to a concrete course outcome.
5. Rebuild Learn later from a new work order—not retired content.
