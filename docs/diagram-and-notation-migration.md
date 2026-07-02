# Diagram and Notation Migration

**Status:** In progress

## Completed shared rails

### Semantic notation

The app has first-class React components for:

- chord symbols;
- Roman-numeral functions;
- intervals;
- keys;
- notes;
- frets and bars;
- token lists for authored music content.

New data should use `MusicToken[]`, `Chord`, `FunctionalChord`, `IntervalName`, `SpelledNote`, and `KeyContext`. New components must not depend on `MusicTypography` to discover notation from prose.

### Diagram components

| Component | Use | Input |
|---|---|---|
| `FretboardMap` | Full interactive After Hours neck | Typed chords, keys, generated CAGED/pentatonic layers |
| `GuitarDiagram` | Compact voicing, triad, shell, or chord-tone card | Engine `IntervalPosition[]` |
| `FullNeckDiagram` | Lesson and practice full neck | Engine `IntervalPosition[]` |

All three use standard-tuning engine coordinates and high-e-to-low-E display order. They do not own pitch-class tables, manual note lookup, or per-key coordinate arrays.

### Migrated surfaces

- Autumn Leaves and 12-Bar Blues forms are typed `Chord` plus `FunctionalChord` data.
- After Hours chord maps, active chord selector, arpeggios, and scale maps consume typed chords.
- After Hours compact shell diagrams are generated from the voicing recipe/search engine.
- ChangeStepper generates chords, guide tones, functions, intervals, and notes from the engine.
- Daily practice extras use `FullNeckDiagram`, engine scale positions, and explicit pattern tokens.
- Daily lick/exercise pattern data now supports `MusicToken[]` and renders without regex inference.

## Remaining migration scope

### 1. Native lesson-page extraction

`App.tsx` still contains legacy local implementations of:

- `ChordSymbol`;
- `FunctionSymbol`;
- `IntervalPanel`;
- `Fretboard`.

These should be extracted into native lesson modules and replaced with:

- `ChordNotation` / `FunctionNotation` / `IntervalNotation` / `NoteNotation` / `KeyNotation`;
- `FullNeckDiagram`;
- typed lesson harmony examples and tokenized lesson prose.

Do not add a DOM replacement bridge for the other lesson pages.

### 2. Lesson/catalog data

The catalog currently stores many music-bearing sentences as strings. Add structured fields for:

- tokenized concept summaries where notation appears;
- typed chord/function examples;
- typed routine segments where interval/chord language is intentional.

Plain prose should stay plain prose. Only musical syntax needs tokens.

### 3. Retire legacy inference

`MusicTypography` is transitional. Once native lesson and catalog content have been migrated, narrow it to an optional legacy compatibility wrapper and remove its notation-detection rules.

### 4. Diagram family coverage

Add engine configurations for:

- major pentatonic;
- triads;
- seventh-chord arpeggios;
- shell voicings;
- Drop 2;
- guide-tone and voice-leading maps.

Every new diagram family must use engine positions and one shared renderer.

## Completion criteria

The migration is complete when:

1. No active page calculates notes from a page-local `NOTE_INDEX`, `TUNING`, or hand-authored key-specific fret map.
2. No active page parses a display chord string to recover musical meaning.
3. All active music syntax is rendered from semantic components or `MusicToken[]`.
4. Every diagram route uses `FretboardMap`, `FullNeckDiagram`, or `GuitarDiagram`.
5. `MusicTypography` can be removed without changing notation behavior.
