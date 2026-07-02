# Minor Pentatonic Box Contract

**Status:** Engine-backed, standard tuning only.

## What is generated

The five minor-pentatonic boxes are now parent geometries relative to a root on the low E string. The engine receives:

1. a minor root;
2. six-string standard tuning;
3. a fret range.

It finds every needed low-E root anchor around that range, places each box, crops only notes outside the visible fret window, and verifies every resulting fret against the correct minor-pentatonic interval:

```text
1 · ♭3 · 4 · 5 · ♭7
```

No key gets its own hand-authored coordinate table.

## E minor reference cycle

With E as the low-E root at fret 0, the five boxes are:

```text
Box 1
E: 0  3        B: 0  3
A: 0  2        G: 0  2
D: 0  2        e: 0  3

Box 2
E: 3  5        B: 3  5
A: 2  5        G: 2  5
D: 2  5        e: 3  5

Box 3
E: 5  7        B: 5  8
A: 5  7        G: 4  7
D: 5  7        e: 5  7

Box 4
E: 7 10        B: 8 10
A: 7 10        G: 7  9
D: 7  9        e: 7 10

Box 5
E: 10 12       B: 10 12
A: 9  12       G: 9  12
D: 9  12       e: 10 12
```

The B-string adjustment in Boxes 3 and 4 is deliberate. It is part of standard tuning’s major-third B-to-G relationship, and is exactly the sort of error the generated model and contract are meant to prevent.

Adjacent boxes share boundary notes by design. On the full neck, that shared note retains both box memberships in the marker ring and fret-detail panel rather than being silently assigned to one box.

## Visual rule

The pentatonic layer keeps a coherent gold-to-violet box sequence:

- Box 1: gold
- Box 2: orange
- Box 3: coral
- Box 4: rose
- Box 5: violet

The visible interval label is still controlled by the active focus layer. With Arpeggio active, a chord-tone label wins; box membership remains inspectable on the marker.

## Supported tuning rule

These five geometries are approved for six-string standard tuning, E2–A2–D3–G3–B3–E4. In alternate or custom tunings, the engine must use general chord/scale coordinates until a tuning-specific pentatonic family is validated.

## Contract coverage

The music contract checks:

- all five E-minor parent boxes;
- the canonical Box 1 matrix;
- Box 3 and Box 4 B-string crossings;
- all five boxes in all twelve chromatic roots;
- interval membership, root visibility, and twelve-tone count per complete box;
- correct cropped behavior through the shared fret-range generator;
- rejection of unvalidated alternate-tuning geometry.
