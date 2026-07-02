# Morning Changes Work Order

Last updated: 2026-07-02

## Rules

1. Do not redesign Morning Changes unless explicitly asked.
2. Do not change product content unless explicitly asked.
3. Do not use DOM patches, temporary adapters, or error-boundary-only fixes.
4. Preserve the current visual identity and layout language.
5. Update README, this work order, and agent handoff after significant work.
6. Green checks normally mean merge and deploy unless explicitly held.
7. Every release message must include a visible `Look for:` cue and expected `Live build · <commit>` footer.

## Active core

Navigation is intentionally limited to Home, Fretboard, After Hours, and Tools.

- `/fretboard`: shared musician-facing full-neck workspace.
- `/after-hours`: authored standards library.
- `/after-hours/autumn-leaves`: whole-form Autumn Leaves study.
- `/after-hours/12-bar-blues`: real 12-Bar Blues study.
- `/tools`: metronome.
- Retired lesson/profile/daily routes redirect Home.

Home remains a core-space gateway, not a daily lesson dashboard.

## After Hours identity and standards

Every `/after-hours` route shows a black circular mark with a white ring, `After Hours`, and `Standards Library`.

The mark has the same 37px footprint as the normal wordmark mark and must remain black with a white ring in every theme, including Light and Student. Do not restore the old semi-circle glyph.

The active standards are:

- Autumn Leaves: whole-form focused application at frets 7–11. The selector uses unique chord choices from `study.form`; the ordered events are separately supplied to the shared renderer as `progression` for target-tone guidance.
- 12-Bar Blues: three authored variants—Texas Flood, Crossroads, and The Thrill Is Gone.

After Hours is authored repertoire. Its active chord selector must stay limited to the real chords in the selected standard. Do not add the free-form Fretboard builder there.

## Fretboard architecture

`AfterHoursFretboardCustomizer` is the one shared renderer for full-neck exploration and compact standard studies.

The final musicianship foundation includes:

- 15 conventional key signatures with major/minor study context.
- Practical chord parsing: 6, m6, 6/9, mMaj7, 7sus4, altered dominant extensions, standard extensions, adds, diminished, augmented, and suspended forms.
- Engine-backed custom chords from interval buttons.
- Primary visual controls: Pentatonic, Arpeggio, Chord.
- More options: Targets, Triads, CAGED, Scale, scale context, marker labels, neck position, inversion, and voicing.
- Scale contexts: diatonic modes, harmonic/melodic minor, Lydian dominant, Phrygian dominant, altered, and minor blues.
- Interval/name labels and full, low, middle, or upper neck focus.
- Canonical guide-tone motions and optional target overlays for ordered chord progressions.

### Course and standard authoring contract

Course or standard material must consume the shared renderer. It provides:

```tsx
<AfterHoursFretboardCustomizer
  chords={uniqueChordChoices}
  progression={orderedChordEvents}
  fretRange={{ start: 7, end: 11 }}
  compact
/>
```

`chords` is the unique active-chord menu. `progression` preserves the actual event order and enables next-chord target tones. Do not create lesson-local fretboards, hard-code target notes, or manually duplicate voice-leading behavior.

`FretboardChordOption` may include an authored `scaleMode` and `functionLabel`. Music behavior belongs in `apps/web/src/lib/music`; visual components only consume structured data.

The primary control row stays intentionally restricted to Pentatonic, Arpeggio, and Chord. CAGED, Triads, Scale, Targets, inversion, voicing, label mode, and neck position belong under `More options`.

## Retired content

The old lesson library, paths, daily rotation, licks, exercises, practice extras, lesson dashboard, and progress persistence are removed. Do not restore them without a new explicit rebuild work order.

## Quality and release proof

Run:

```bash
cd apps/web
npm run check
npm run music:contract
npm run build
```

Browser smoke verifies:

1. Home remains core-only.
2. Fretboard has the unified in-surface Study Key controls, practical builder, harmonic-motion selector, primary three-toggle row, More options, and no error boundary.
3. Autumn Leaves has the After Hours identity, whole-form selector, and shared voice-leading surface.
4. 12-Bar Blues exposes all three study variants and no error boundary.

The live footer is the deployment source of truth. See `docs/RELEASE_VERIFICATION.md`.

## Next work

1. Build the first courses and additional standards on the shared progression contract.
2. Add a true two-octave scale-path generator.
3. Carry focused-map state to the full-neck URL.
4. Add rhythm comping and backing-track work only when it supports a concrete course outcome.
5. Rebuild Learn later from a fresh work order, not retired data.
