# CAGED Major Form Contract

**Status:** Engine-backed, standard tuning only.

## What is now generated

The CAGED layer is no longer placed from a per-key page coordinate array.

Each form is a single parent geometry in six-string standard tuning:

| Form | Open parent | Sounding-string geometry, low to high | Root source |
|---|---|---|---|
| C | C major | x 3 2 0 1 0 | A string |
| A | A major | x 0 2 2 2 0 | A string |
| G | G major | 3 2 0 0 0 3 | low E / G / high e roots |
| E | E major | 0 2 2 1 0 0 | low E / D / high e roots |
| D | D major | x x 0 2 3 2 | D / B string roots |

The engine takes a selected root, calculates the chromatic shift from the named open parent, places every sounding string, and verifies each resulting coordinate against the correct root / third / fifth pitch class. A root change therefore generates a new form; it does not select another hand-authored screen map.

## C major reference cycle

The contract checks this exact cycle:

```text
C form: x 3 2 0 1 0
A form: x 3 5 5 5 3
G form: 8 7 5 5 5 8
E form: 8 10 10 9 8 8
D form: x x 10 12 13 12
```

This is the C → A → G → E → D movement of one CAGED cycle. The same parent definitions are checked across all twelve chromatic roots.

## Visual rule

Each parent form retains a stable identity independent of the app theme:

- C form: blue
- A form: pink
- G form: violet
- E form: green
- D form: amber

When a form overlaps another active map, its identity is preserved in the segmented marker ring and the per-fret detail panel.

## Supported tuning rule

CAGED parent geometry is currently enabled only for six-string standard tuning, E2–A2–D3–G3–B3–E4. The B-string major-third offset is part of why the geometry is specific to standard tuning.

For alternate/custom tunings, the engine must fall back to theory-generated scales/chord tones until a separate, validated shape family exists. It must never quietly reuse a standard-tuning CAGED grip in a tuning where it is wrong.

## Still not complete

- CAGED **scale regions** around the parent chord skeletons are not implemented yet.
- Pentatonic remains on the legacy template path and must receive the same parent-generator/contract treatment next.
- CAGED is not yet exposed as a tuning/capo-aware More-panel control; that requires the future instrument/configuration model.
