# Morning Changes Music Engine Work Order

**Status:** Active foundation build  
**Owner:** Morning Changes  
**Purpose:** Replace duplicated theory helpers, hand-positioned fretboard logic, and regex-based notation inference with one typed music model that can drive every lesson and After Hours study.

---

## Product decisions already locked

1. **One canonical music engine.** Notes, keys, scales, chord formulas, functional harmony, string tunings, fretboard coordinates, and shape placement live in `apps/web/src/lib/music`.
2. **Semantic notation, not text guessing.** Pages will render structured music tokens (`Chord`, `Function`, `Interval`, `KeyName`, `FretNumber`) instead of scanning prose after render.
3. **One reusable full-neck component.** After Hours, root lessons, chord-tone lessons, scale lessons, and future visual tools use the same fretboard renderer and the same coordinate engine.
4. **Physical shapes stay intentional.** CAGED and pentatonic positions are validated guitar templates, not guessed from generic pitch classes. The engine places and labels a template in a selected key.
5. **High e on top, low E on bottom.** The engine stores tuning in low-to-high order; the renderer decides display order.
6. **Root markers always use dark/black ink on a light marker.** This is independent of app theme.
7. **Key names are prose.** `B minor`, `B♭ major`, etc. are bold key references. Chords, notes, intervals, frets, bars, and functions remain distinct semantic types.

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
A single fret may belong to multiple active layers. The previous approach placed multiple labeled dots in the same cell and created contradictory-looking interval labels. The new renderer must use one primary label per fret position.

1. A configurable **focus layer** determines the visible interval label. Default focus is `arpeggio`.
2. Other active layers are represented through a compact multi-layer marker treatment, never a second competing interval label:
   - segmented ring or stacked border ticks for 2–4 active memberships;
   - root stays a square marker;
   - a tap/click/keyboard detail panel lists every active role and interval at that position.
3. When two layers agree on the interval, show the shared label once and add the multi-layer treatment.
4. When they disagree, show the focus-layer label and expose the other role in the detail panel.
5. Never show a fret number as an interval, or an interval as a fret number.

### CAGED visual system
- Five validated CAGED templates: `E`, `D`, `C`, `A`, `G`.
- Each receives a stable visual identity: a distinct color + shape-zone/outline pattern, not just another dot color.
- CAGED regions should read as connected neighborhoods on the neck, while note markers remain legible.
- Do not migrate the current CAGED coordinate arrays as authoritative data. Audit and rebuild each template against validated guitar shapes first.

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
  harmony.ts     Keys, scales, chords, functional harmony
  fretboard.ts   Tuning, coordinates, position lookup, interval maps
  shapes.ts      Validated physical guitar templates and placement
  notation.ts    Structured semantic token schema
  index.ts       Public engine boundary
```

### Rules
- UI components may consume `lib/music`; `lib/music` must not import React or page components.
- The fretboard renderer may not carry its own pitch-class table, interval formulas, or manual transposition code.
- Progressions are authored as functions and qualities where practical; display strings are derived.
- A fretboard map receives typed `Note`, `Chord`, `Scale`, `Shape`, and `Position` data. It does not parse labels as source truth.

---

## Build phases

### Phase 0 — Safety and reference
- [x] Document this work order.
- [x] Keep live app behavior stable during engine construction.
- [ ] Add a Music Engine contract page with all token classes across every theme.
- [ ] Add automated build/test harness for engine cases.

### Phase 1 — Core engine foundation
- [x] Typed note, interval, key, chord, scale, tuning, shape, and notation models.
- [x] Correct pitch-class and interval transposition primitives.
- [x] Context-aware note spelling from interval + root.
- [x] Key/scale and chord construction primitives.
- [x] Fretboard coordinate and interval-location primitives.
- [x] Shape-template placement primitive.
- [ ] Add test cases for all 12 chromatic roots, flat/sharp spellings, and supported chord qualities.

### Phase 2 — Notation migration
- [ ] Build React renderers for semantic notation tokens.
- [ ] Convert After Hours headings, key descriptions, Study Changes, and headphone cards.
- [ ] Convert home page cards and practice plans.
- [ ] Convert Find the Root lesson.
- [ ] Narrow then retire regex/MusicTypography inference.

### Phase 3 — Fretboard migration
- [ ] Make `FretboardMap` consume `lib/music/fretboard` only.
- [ ] Replace current duplicated pitch-class, scale, and chord-quality tables.
- [ ] Add focus-layer and collision-detail model.
- [ ] Add segmented/ring marker visual treatment.
- [ ] Replace legacy root lesson visual fully through the shared component.
- [ ] Build roots, triads, scale, chord-tone, and voice-leading configurations from the same map.

### Phase 4 — Shape validation
- [ ] Validate and encode five CAGED templates.
- [ ] Validate and encode five minor-pentatonic boxes.
- [ ] Add major pentatonic, triad, seventh-chord, shell-voicing, and arpeggio templates where a physical shape is pedagogically useful.
- [ ] Store proof/source notes for each template.

### Phase 5 — Progression and standards migration
- [ ] Convert Autumn Leaves to function-based progression data.
- [ ] Convert 12-Bar Blues to major/minor blues function data.
- [ ] Derive selected-key chord maps, chord tones, scales, and neck layers from the engine.
- [ ] Add next-chord target/voice-leading data.
- [ ] Establish a standard authoring format for future After Hours pieces.

---

## Acceptance tests

### Music correctness
- [ ] `B minor` harmonic minor spells `A♯`, not `B♭`.
- [ ] `B♭ major` spells `E♭`, not `D♯`.
- [ ] `F♯7` contains F♯, A♯, C♯, E.
- [ ] `Aø7` contains A, C, E♭, G.
- [ ] The same pitch class can be spelled differently when harmony requires it.
- [ ] All 12 keys can render major, natural minor, harmonic minor, melodic minor, dorian, mixolydian, and locrian maps.

### Fretboard correctness
- [ ] Standard tuning low-to-high is E A D G B e.
- [ ] Display order is high e to low E.
- [ ] Root lesson updates every root position after a key change.
- [ ] Fret labels never receive interval styling.
- [ ] Interval labels never show as fret labels.
- [ ] One visible label maximum per string/fret position.
- [ ] Layer membership remains inspectable when labels are collapsed.

### Notation correctness
- [ ] `B minor` is a bold key token.
- [ ] `Bm7` is a chord token.
- [ ] `B♭` is a note token.
- [ ] `1` used as interval is an interval token.
- [ ] `1` used as a fret or bar number is plain UI text.
- [ ] `iiø7`, `vii°7`, and `V+` render as single semantic function tokens.

---

## Current implementation warning

The current app still has legacy helpers and transitional CSS/DOM adapters. They are not the final source of truth. New music functionality should target `lib/music` first, then migrate a UI surface deliberately rather than adding another local parser or coordinate table.
