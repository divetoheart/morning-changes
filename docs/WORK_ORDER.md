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

- `/fretboard`: flexible shared-map workspace.
- `/after-hours`: authored standards library.
- `/after-hours/autumn-leaves`: Autumn Leaves study.
- `/after-hours/12-bar-blues`: 12-Bar Blues study.
- `/tools`: metronome.
- Retired lesson/profile/daily routes redirect Home.

Home remains a core-space gateway, not a daily lesson dashboard.

## After Hours identity and standards

Every `/after-hours` route shows:

- A solid black circular mark with a white ring.
- `After Hours`.
- `Standards Library`.

Do not bring back the old semi-circle glyph for this route state.

The active standards are:

- Autumn Leaves: focused relative-major ii–V–I application at frets 7–11.
- 12-Bar Blues: three authored variants—Texas Flood, Crossroads, and The Thrill Is Gone.

After Hours is authored repertoire. Its active chord selector must stay limited to the real chords in the selected standard. Do not add the free-form Fretboard builder there.

## Fretboard architecture

`AfterHoursFretboardCustomizer` is the one shared renderer for full-neck exploration and compact standard studies.

The main `/fretboard` route is the free-form lab. It supports:

- All 15 conventional key signatures, including C♯ and C♭.
- Major and minor study context.
- Typed built-in chord symbols.
- Engine-backed custom chords built from interval buttons.
- CAGED, pentatonic, arpeggio, scale, Triads/inversions, Shell, and Drop 2.
- Plain-English detail text derived from layer membership note, interval, string/fret, shape identity, and nearest root.

Custom chord construction belongs in `lib/music` through `buildCustomChord`. Never add page-local note tables.

Layer memberships must preserve the spelled note alongside interval, role, string/fret, layer, and variant. This is required for the detail panel.

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
2. Fretboard has 15-key controls, major/minor mode, chord builder, renderer, voicing controls, footer, and no error boundary.
3. Autumn Leaves has the After Hours identity and focused map.
4. 12-Bar Blues exposes all three study variants and no error boundary.

The live footer is the deployment source of truth. See `docs/RELEASE_VERIFICATION.md`.

## Next work

1. Verify the deployed builder and After Hours mark manually on desktop and mobile.
2. Add a true two-octave scale-path generator.
3. Carry focused-map state into the full-neck link.
4. Add ii–V–I voice-leading paths.
5. Add another standard only with a concrete practice outcome.
6. Rebuild Learn later from a fresh work order, not retired data.
