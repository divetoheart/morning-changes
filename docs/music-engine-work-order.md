# Morning Changes Music Engine Work Order

**Status:** Active migration  
**Owner:** Morning Changes  
**Purpose:** Replace duplicated theory helpers, hand-positioned fretboard logic, and regex-based notation inference with one typed music model that can drive every lesson and After Hours study.

---

## Product decisions already locked

1. **One canonical music engine.** Notes, keys, scales, chord formulas, functional harmony, string tunings, fretboard coordinates, voicing recipes, and shape placement live in `apps/web/src/lib/music`.
2. **Semantic notation, not text guessing.** Pages render typed `ChordNotation`, `FunctionNotation`, `IntervalNotation`, `KeyNotation`, `FretNumber`, and token lists wherever migrated. The old text scanner is a temporary legacy adapter only.
3. **One reusable full-neck component.** After Hours, root lessons, chord-tone lessons, scale lessons, and future visual tools use the same fretboard renderer and the same coordinate engine.
4. **Physical shapes are generated from validated parent geometry.** CAGED major forms and minor-pentatonic boxes are engine-backed for six-string standard tuning. A selected root and fret range generate the map; no key receives a separate coordinate array.
5. **High e on top, low E on bottom.** The engine stores tuning in low-to-high order; the renderer decides display order.
6. **Root markers always use dark/black ink on a light marker.** This is independent of app theme.
7. **Key names are prose.** `B minor`, `B♭ major`, etc. are bold key references. Chords, notes, intervals, frets, bars, and functions remain distinct semantic types.
8. **Voicing recipe is not string hiding.** Drop 2 is generated as a voice-order transformation; shell voicings are generated from required chord tones. String-set selection is a separate playable-guitar search layer.

---

## Fretboard visual contract

### Full-neck range
- Default range: frets `0–15`.
- Includes the first repeated position after fret 12.
- Rendering and theory must both work for arbitrary fret ranges.

### Layer defaults
- Default visible layers: **Pentatonic + Arpeggio**.
- CAGED and Scale are opt-in.
- A lesson can request a filtered mode, including **roots-only**.

### Collision policy — no competing interval labels
A single fret may belong to multiple active layers. The renderer resolves each string/fret to one primary label.

1. A configurable **focus layer** determines the visible interval label. Default focus is `arpeggio`.
2. Other active layers use a compact multi-layer marker treatment, never a second competing interval label:
   - segmented ring for 2–4 active memberships;
   - root is square only when the visible focus label is interval 1;
   - tap/click detail panel lists every active role and interval;
   - title/ARIA carries the same detail.
3. When two layers agree on the interval, show the shared label once and add the multi-layer treatment.
4. When they disagree, show the focus-layer label and expose the other role in the detail panel.
5. Never show a fret number as an interval, or an interval as a fret number.

### Generated shape families

#### CAGED major forms
- Five generated parent forms: `C`, `A`, `G`, `E`, `D`.
- Each has a stable color identity: blue, pink, violet, green, amber.
- Every placed note is verified against its intended `1`, `3`, or `5` pitch class.
- Standard tuning only until an alternate-tuning CAGED family is separately validated.
- Detailed contract: `docs/caged-shape-contract.md`.

#### Minor pentatonic boxes
- Five generated boxes: `1–5`.
- Each uses only `1`, `♭3`, `4`, `5`, `♭7` and is verified after placement.
- Adjacent boxes retain shared boundary memberships rather than overwriting each other.
- Box identity is retained through the marker ring and fret-detail panel.
- Standard tuning only until an alternate-tuning pentatonic family is separately validated.
- Detailed contract: `docs/minor-pentatonic-shape-contract.md`.

### Theme behavior
- Layer color conveys membership and remains stable across themes.
- Text inside every light marker is black/near-black.
- Theme changes surfaces, chrome, and surrounding typography, not the semantic legibility contract.

---

## Architecture target

```text
lib/music/
  types.ts       Shared domain types
  intervals.ts   Interval and scale/chord formula definitions
  pitch.ts       Note parsing, spelling, pitch classes, transposition
  harmony.ts     Keys, scales, chords, functional harmony, controlled parsing
  fretboard.ts   Tuning, coordinates, position lookup, interval maps
  shapes.ts      Generated and validated physical guitar shape families
  voicings.ts    Closed, Drop 2, shell recipes and guitar candidate search
  layers.ts      One-label collision resolution and layer membership
  notation.ts    Structured semantic token schema
  contract.ts    Dependency-free music correctness contract
  index.ts       Public engine boundary

MusicNotation.tsx  React notation components backed by lib/music
```

### Rules
- UI components may consume `lib/music`; `lib/music` must not import React or page components.
- The fretboard renderer may not carry its own pitch-class table, interval formulas, or manual transposition code.
- Progressions are authored as functions and qualities where practical; display strings are derived.
- A fretboard map receives typed `Note`, `Chord`, `Scale`, `Shape`, and `Position` data. It does not parse labels as source truth.
- A voicing engine returns voice order first; guitar candidate search maps it onto a selected low-to-high string set using real open-string MIDI pitches.
- Legacy symbol strings may pass through a controlled engine parser at a migration boundary; DOM-wide text inference must not create new product behavior.

---

## Build phases

### Phase 0 — Safety and reference
- [x] Document this work order.
- [x] Keep live app behavior stable during engine construction.
- [x] Add a dependency-free music-engine contract suite for spelling, chord formulas, tuning order, roots, collisions, voicings, function symbols, CAGED, and pentatonic geometry.
- [x] Wire the contract suite into the `npm run quality` gate and GitHub Actions workflow.
- [ ] Add an inspectable Music Engine contract page with every token class across every theme.

### Phase 1 — Core engine foundation
- [x] Typed note, interval, key, chord, scale, tuning, shape, notation, collision, and voicing models.
- [x] Correct pitch-class and interval transposition primitives.
- [x] Context-aware note spelling from interval + root.
- [x] Key/scale and chord construction primitives.
- [x] Fretboard coordinate and interval-location primitives with absolute string MIDI pitch.
- [x] Closed-position, Drop 2, and shell voicing recipe generation.
- [x] Guitar voicing candidate search by string set, fret range, actual pitch order, and maximum span.
- [x] Controlled legacy chord-symbol parser at the engine boundary.
- [x] Generated CAGED-major and minor-pentatonic physical shape families for standard tuning.
- [ ] Add coverage for all supported modes, chord qualities, tunings, arbitrary fret ranges, and voicing inversions.

### Phase 2 — Notation migration
- [x] Build React renderers for semantic notation tokens.
- [x] Protect semantic notation from legacy `MusicTypography` DOM inference.
- [x] Convert After Hours Study Changes to structured functional harmony and semantic chord/function tokens.
- [x] Convert Autumn Leaves key headings, fretboard study labels, editorial key references, and function descriptions.
- [x] Convert the shared root-fretboard explanation’s interval 1 token.
- [ ] Convert home page cards, lesson cards, and practice-plan content objects.
- [ ] Replace legacy App-level chord/function renderers.
- [ ] Narrow then retire regex/MusicTypography inference.

### Phase 3 — Fretboard migration
- [x] Use `lib/music` for standard tuning, display order, roots-only mode, chord-tone positions, and scale positions in the shared `FretboardMap`.
- [x] Replace active shared-neck CAGED and pentatonic coordinate arrays with generated validated shape families.
- [x] Build collision-resolution data model with arpeggio as the default focus layer.
- [x] Render a single-label segmented-marker treatment from collision data.
- [x] Add a keyboard/touch-friendly per-fret detail panel with every active membership.
- [ ] Replace the temporary root-lesson DOM mounting bridge with native React-tree integration.
- [ ] Build triad, chord-tone, scale, shell, Drop 2, and voice-leading configurations from the same map.

### Phase 4 — Shape validation
- [x] Validate and encode five CAGED parent forms for standard tuning.
- [x] Validate and encode five minor-pentatonic boxes for standard tuning.
- [x] Store canonical geometry and contract notes for both families.
- [ ] Add major pentatonic, triad, seventh-chord, shell-voicing, and arpeggio templates where a physical shape is pedagogically useful.
- [ ] Add separate validated shape families for capo and alternate/custom tunings.

### Phase 5 — Progression and standards migration
- [x] Convert Autumn Leaves to function-based progression data.
- [x] Convert 12-Bar Blues to major/minor blues function data.
- [ ] Derive selected-key chord maps, chord tones, scales, and neck layers from the engine end-to-end.
- [ ] Add next-chord target/voice-leading data.
- [ ] Establish a standard authoring format for future After Hours pieces.

---

## Acceptance tests

### Music correctness
- [x] `B minor` harmonic minor spells `A♯`, not `B♭`.
- [x] `B♭ major` spells `E♭`, not `D♯`.
- [x] `F♯7` contains F♯, A♯, C♯, E.
- [x] `Aø7` contains A, C, E♭, G.
- [x] The same pitch class can be spelled differently when harmony requires it.
- [x] All 12 flat/natural key centers render a correctly lettered major scale.
- [x] Cmaj7 root Drop 2 is `5–1–3–7`; first-inversion Drop 2 is `7–3–5–1`.
- [x] A root-position F7 shell can generate `1–3–♭7`.
- [x] A Drop 2 voice order can locate playable ascending D–G–B–e guitar candidates.
- [x] All twelve roots generate verified CAGED major forms and minor-pentatonic boxes in standard tuning.
- [ ] All twelve keys can render major, natural minor, harmonic minor, melodic minor, dorian, mixolydian, and locrian maps.

### Fretboard correctness
- [x] Standard tuning low-to-high is E A D G B e.
- [x] Display order is high e to low E.
- [x] Shared root view derives root positions from the engine.
- [x] CAGED and pentatonic memberships retain named form/box identity at shared boundary notes.
- [x] Collision resolver creates one visible marker per string/fret and retains memberships for detail.
- [x] Active collision rendering presents one focus-layer label plus a segmented membership ring.
- [x] Layer membership is tap/click inspectable and keyboard focusable.
- [ ] Fret labels never receive interval styling across all legacy lesson visuals.
- [ ] Interval labels never show as fret labels across all legacy lesson visuals.

### Notation correctness
- [x] `B minor` is a semantic bold key token in migrated After Hours surfaces.
- [x] Migrated chord cells render from engine Chord data.
- [x] `1` in the shared root lesson explanation is a semantic interval token.
- [x] `iiø7` renders as one semantic function token in After Hours and the engine contract.
- [ ] `B♭` is a semantic note token where standalone notes are migrated.
- [ ] `1` used as a fret or bar number is plain UI text everywhere.
- [ ] Home, learn, and practice-plan content no longer depend on regex inference.

---

## Current implementation note

The shared After Hours neck now uses generated engine-backed CAGED and minor-pentatonic shape data. Remaining transitional code is concentrated in legacy lesson rendering, legacy diagram patterns, and text-style inference. New fretboard work must extend `lib/music` and the shared `FretboardMap`; it must not add page-local note tables or new DOM replacement paths.
