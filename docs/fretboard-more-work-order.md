# Dynamic Fretboard: More Panel Work Order

**Status:** Planned — do not start until the current production baseline is complete.

## Why this exists

The shared fretboard is becoming the product’s central musical surface. It cannot become a pile of one-off switches that each mutate dots differently. “More” must be a configuration surface over the canonical music engine: a user changes a typed study configuration, the engine recalculates the guitar map, and the renderer draws the result.

This is a future product phase, not a temporary UI patch.

---

## Delivery rule

No “good for now” feature is allowed in this area.

Before a new control is connected to the live fretboard, it needs all four:

1. **Typed configuration model** — the control has a durable home in the shared engine/API.
2. **Engine behavior** — the change recalculates notes, pitches, voicings, or locations from source data rather than hiding or repainting existing UI.
3. **Contracts/tests** — supported combinations and invalid combinations are covered.
4. **Migration/cleanup plan** — it does not create a second fretboard implementation or leave a local data table that later has to be rewritten.

A visually complete feature that fails any one of those is not considered complete.

---

## Product goal

The More panel should make one reusable fretboard adaptable for:

- any study key and scale/chord context;
- standard, preset, and custom tunings;
- capo-aware concert and shape pitch;
- full-neck maps or selected playable string sets;
- CAGED, pentatonic, scale, arpeggio, chord-tone, triad, shell, and Drop 2 views;
- inversions, omitted tones, doubled tones, and voicing constraints;
- player-friendly display preferences without breaking theory correctness.

The output is always one consistent neck model, not a separate diagram family per feature.

---

## Core configuration model

The future public interface should look conceptually like this:

```ts
export type FretboardStudyConfig = {
  instrument: {
    tuning: StringTuning;
    capo: CapoConfig;
    fretRange: FretRange;
  };
  target: {
    key?: KeyContext;
    chord?: Chord;
    progression?: ProgressionContext;
  };
  view: {
    layers: FretboardLayerId[];
    focusLayer: FretboardLayerId;
    labelMode: 'interval' | 'note' | 'both' | 'role';
    displayStringSet?: readonly number[];
    showOpenStrings: boolean;
  };
  voicing?: {
    recipe: VoicingRecipe;
    inversion?: 0 | 1 | 2 | 3;
    stringSet?: readonly number[];
    omitIntervals?: readonly IntervalName[];
    requiredIntervals?: readonly IntervalName[];
    allowDoubling?: boolean;
    maxFretSpan?: number;
    preferredPosition?: number;
  };
};
```

The exact types may evolve, but the separation must remain:

- **instrument setup** determines actual pitches;
- **target** determines the musical material;
- **view** determines what is visible and how it is labeled;
- **voicing** determines playable chord-tone selection and ordering.

---

## More panel UX

“More” should open a mobile-first bottom sheet on small screens and a contained side panel/popover on desktop. It should never force the player to leave the neck.

### 1. Setup

- Tuning preset selector.
- Custom tuning editor, one low-to-high string row at a time.
- Capo fret selector.
- Capo scope:
  - full capo;
  - partial capo only after the engine explicitly supports it.
- Visible fret range.
- Show/hide open-string labels.

### 2. Voicing

- Voice mode:
  - full note map;
  - triads;
  - shell;
  - closed;
  - Drop 2;
  - later: Drop 3, rootless, quartal, custom formula.
- Inversion selector where valid.
- String-set selector, expressed as actual strings—not a cosmetic hide toggle.
- Required tones / omit tones.
- Optional fifth, optional root, doubling allowed/not allowed.
- Maximum fret span and preferred position.

### 3. Display

- Layer visibility.
- Focus layer for collisions.
- Interval / note / role labels.
- CAGED region overlay when validated templates exist.
- Pentatonic box overlay when validated templates exist.
- Position markers and repeat-after-12th setting.

### 4. Study behavior

- Active chord within a progression.
- Next-chord targets / guide tones, once voice-leading work is complete.
- Reset to lesson defaults.
- Save a personal preset locally.
- Copy/share a compact configuration URL only after state serialization is stable.

---

## Important musical rules

### Capo

A capo is not a visual fret offset.

The engine must maintain both:

- **shape pitch** — what the guitarist sees/fingers relative to the capo;
- **concert pitch** — what the instrument actually sounds.

Every chord label, note label, voicing candidate, and transposition must state which perspective it uses. The default app convention should be explicit in the UI.

### Custom tuning

A custom tuning must provide both:

- correctly spelled open-string notes;
- absolute open-string MIDI pitches.

Two strings may share a pitch class but not an octave. A tuning that only stores note names is insufficient for voicing search.

### Omitting strings vs. omitting tones

These are separate controls:

- **string-set selection** limits where a voicing may be played;
- **omit interval/tone** changes the voicing recipe itself;
- **display string visibility** only changes what the UI shows.

The app must never pretend that hiding the A string created a Drop 2 voicing.

### Inversions

Inversion belongs to the voicing generator, not the renderer. The engine creates the intended low-to-high voice order; the guitar search finds playable placements.

### CAGED and pentatonic

CAGED and named pentatonic boxes remain conventions. They should be represented by validated, parameterized shape generators—not hard-coded screen coordinates—and then placed by the same tuning/capo-aware coordinate engine.

---

## Implementation phases

### Phase M0 — Production baseline first

Do not begin More UI until these are complete:

- [ ] CI/build command is running and visible on every main-branch commit.
- [ ] Engine contracts run in CI, not only development browser execution.
- [ ] Current legacy `MusicTypography` inference has a retirement plan with clear ownership.
- [ ] The root-lesson DOM injection bridge in `content-fixes.ts` is replaced by a native React integration.
- [ ] CAGED and pentatonic legacy coordinate arrays are either validated/migrated or visibly treated as unavailable.
- [ ] Shared fretboard can consume typed progression/chord data without parsing display labels as truth.

### Phase M1 — Instrument model

- [ ] Formal `CapoConfig` type with full-capo behavior and contracts.
- [ ] Tuning presets: Standard, Half-Step Down, Drop D, D Standard, and approved open tunings.
- [ ] Custom tuning validator: string count, note spelling, MIDI order, duplicate/string-octave handling.
- [ ] Tuning/capo-aware coordinate and label tests.
- [ ] Explicit shape-pitch versus concert-pitch display policy.

### Phase M2 — Fretboard configuration API

- [ ] Implement `FretboardStudyConfig` (or final equivalent).
- [ ] One config-to-map pipeline: no local component recomputation rules.
- [ ] Persist safe defaults per lesson/standard.
- [ ] Add state serialization and validation before any saved/share presets.

### Phase M3 — Voicing depth

- [ ] Promote the current closed/Drop 2/shell prototype to a tested candidate-ranking system.
- [ ] Add inversions, required/omitted tones, string sets, fret span, and position preferences.
- [ ] Add candidate ranking for playability; do not present every mathematically valid but awkward voicing as equal.
- [ ] Add triad and seventh-chord views.
- [ ] Add one production lesson using the generated shell/Drop 2 output before exposing generic controls.

### Phase M4 — More panel UI

- [ ] Build Setup, Voicing, Display, and Study sections.
- [ ] Make every control keyboard accessible and mobile-safe.
- [ ] Add reset-to-lesson defaults.
- [ ] Add explicit explanations when a requested combination has no playable candidate.
- [ ] Add telemetry-free local preset persistence only after configuration schema stabilizes.

### Phase M5 — Advanced options

- [ ] Partial capo support.
- [ ] Additional tunings and seven-string support only after the string model is proven.
- [ ] Drop 3, rootless, quartal, spread, and user-defined formulas.
- [ ] Voice-leading target overlays across a progression.
- [ ] Shareable study URLs and exportable printable views.

---

## Acceptance tests for More

### Engine correctness

- [ ] Full capo transposes sounding pitch correctly on every string and fret.
- [ ] A capo does not change the physical relative fret geometry the player sees.
- [ ] Drop D changes low-string locations while preserving the other five strings.
- [ ] Custom tuning with different octaves produces correct ascending voicing candidates.
- [ ] Invalid custom tuning input produces an explanation, never a misleading neck.
- [ ] Every selected inversion has the intended lowest theoretical voice.
- [ ] Omitting a fifth changes the recipe, not merely its display.
- [ ] Selecting a string set limits the guitar candidate search, not only visible rows.

### UX correctness

- [ ] The More panel states whether labels are concert pitch or shape pitch.
- [ ] Every enabled option can reset cleanly to the lesson default.
- [ ] Unsupported combinations fail clearly and keep the last valid map visible.
- [ ] A saved preset round-trips through the typed configuration schema.
- [ ] A screen-reader user can inspect marker details and operate every More control.

---

## Explicit non-goals for the first More release

- No partial capo.
- No arbitrary number of strings.
- No custom microtonal tuning.
- No automatic fingering claim unless the engine has a real fingering/ranking model.
- No “AI-generated” shape claims without an auditable theory/geometry source.

---

## Current priority order

1. Finish the production baseline and remove transition-only paths.
2. Validate/migrate CAGED and pentatonic shapes.
3. Finish semantic notation migration and retire regex inference.
4. Make the current After Hours standards fully engine-driven end-to-end.
5. Build and ship one real shell/Drop 2 lesson using the engine.
6. Build the instrument/configuration API.
7. Build the More panel on top of that stable API.
