import { fretPosition, STANDARD_TUNING } from './fretboard';
import { mod12, noteToString, parseNote, transposeNote } from './pitch';
import type { FretRange, IntervalName, PlacedShapeTone, ShapeTemplate, SpelledNote, StringTuning } from './types';

export type ShapeAnchor = {
  /** Low-to-high string index for the template's declared root anchor. */
  stringIndex: number;
  fret: number;
};

export type CagedMajorForm = 'C' | 'A' | 'G' | 'E' | 'D';

type CagedParentGeometry = {
  /** The actual open-chord parent, before it is transposed to the chosen root. */
  openRoot: string;
  /** Low E to high e. Null means that parent shape does not sound that string. */
  frets: readonly (number | null)[];
  /** Low E to high e, aligned with frets. */
  intervals: readonly (IntervalName | null)[];
  colorId: string;
};

export type GeneratedCagedMajorForm = {
  form: CagedMajorForm;
  root: SpelledNote;
  tuningId: string;
  /** Sounding notes in low-to-high string order. */
  positions: readonly PlacedShapeTone[];
  mutedStrings: readonly number[];
  /** Semitone shift from the named open parent to the selected root. */
  transposition: number;
};

/**
 * These are parent chord geometries, not per-key coordinates. Placement is
 * derived by transposing the named open C/A/G/E/D major form to the selected root.
 * The B-string offset is therefore preserved as part of standard-tuning geometry.
 */
export const CAGED_MAJOR_PARENT_GEOMETRIES: Readonly<Record<CagedMajorForm, CagedParentGeometry>> = {
  C: { openRoot: 'C', frets: [null, 3, 2, 0, 1, 0], intervals: [null, '1', '3', '5', '1', '3'], colorId: 'caged-c' },
  A: { openRoot: 'A', frets: [null, 0, 2, 2, 2, 0], intervals: [null, '1', '5', '1', '3', '5'], colorId: 'caged-a' },
  G: { openRoot: 'G', frets: [3, 2, 0, 0, 0, 3], intervals: ['1', '3', '5', '1', '3', '1'], colorId: 'caged-g' },
  E: { openRoot: 'E', frets: [0, 2, 2, 1, 0, 0], intervals: ['1', '5', '1', '3', '5', '1'], colorId: 'caged-e' },
  D: { openRoot: 'D', frets: [null, null, 0, 2, 3, 2], intervals: [null, null, '1', '5', '1', '3'], colorId: 'caged-d' }
};

export const CAGED_MAJOR_FORM_ORDER: readonly CagedMajorForm[] = ['C', 'A', 'G', 'E', 'D'];

function isStandardTuningGeometry(tuning: StringTuning) {
  return tuning.openMidi.length === STANDARD_TUNING.openMidi.length
    && tuning.openMidi.every((pitch, index) => pitch === STANDARD_TUNING.openMidi[index]);
}

function assertCagedTuning(tuning: StringTuning) {
  if (!isStandardTuningGeometry(tuning)) {
    throw new Error('CAGED major forms are currently defined for six-string standard tuning only. Use the general scale/chord engine for alternate tunings until a tuning-specific shape family is validated.');
  }
}

/**
 * Generates one entire CAGED major parent form from exactly two inputs: the named
 * parent geometry and a selected root. There are no per-key coordinate arrays.
 */
export function generateCagedMajorForm(
  form: CagedMajorForm,
  root: string | SpelledNote,
  tuning: StringTuning = STANDARD_TUNING
): GeneratedCagedMajorForm {
  assertCagedTuning(tuning);
  const rootNote = typeof root === 'string' ? parseNote(root) : root;
  const parent = CAGED_MAJOR_PARENT_GEOMETRIES[form];
  const parentRoot = parseNote(parent.openRoot);
  const transposition = mod12(rootNote.pitchClass - parentRoot.pitchClass);
  const positions: PlacedShapeTone[] = [];
  const mutedStrings: number[] = [];

  parent.frets.forEach((baseFret, stringIndex) => {
    const interval = parent.intervals[stringIndex];
    if (baseFret === null || interval === null) {
      mutedStrings.push(stringIndex);
      return;
    }
    const fret = baseFret + transposition;
    const position = fretPosition(tuning, stringIndex, fret);
    const note = transposeNote(rootNote, interval);
    if (position.pitchClass !== note.pitchClass) {
      throw new Error(`CAGED ${form}-form mismatch for ${noteToString(rootNote)} on string ${stringIndex}, fret ${fret}.`);
    }
    positions.push({
      ...position,
      interval,
      note,
      role: interval === '1' ? 'root' : 'shapeTone',
      shapeId: `caged-major-${form.toLowerCase()}`,
      shapeFamily: 'caged',
      colorId: parent.colorId
    });
  });

  return { form, root: rootNote, tuningId: tuning.id, positions, mutedStrings, transposition };
}

/**
 * Generates the full C-A-G-E-D cycle for one major root. Consumers can later
 * crop this to a fret window or use it as the skeleton for a scale-region overlay.
 */
export function generateCagedMajorCycle(root: string | SpelledNote, tuning: StringTuning = STANDARD_TUNING): GeneratedCagedMajorForm[] {
  return CAGED_MAJOR_FORM_ORDER.map(form => generateCagedMajorForm(form, root, tuning));
}

/**
 * Places a validated physical guitar template from its declared root anchor.
 * Template data remains separate from theory: a shape is a guitarist-friendly
 * path, while the engine supplies correct pitch and interval labels in any key.
 */
export function placeShape(
  template: ShapeTemplate,
  root: SpelledNote,
  anchor: ShapeAnchor,
  tuning: StringTuning,
  range: FretRange
): PlacedShapeTone[] {
  const placed: PlacedShapeTone[] = [];
  for (const cell of template.cells) {
    const stringIndex = anchor.stringIndex + cell.stringDelta;
    const fret = anchor.fret + cell.fretDelta;
    if (stringIndex < 0 || stringIndex >= tuning.openStrings.length || fret < range.start || fret > range.end) continue;
    const position = fretPosition(tuning, stringIndex, fret);
    const note = transposeNote(root, cell.interval);
    if (position.pitchClass !== note.pitchClass) {
      throw new Error(`Shape ${template.id} does not match ${note.letter} at string ${stringIndex}, fret ${fret}.`);
    }
    placed.push({
      ...position,
      interval: cell.interval,
      note,
      role: cell.interval === '1' ? 'root' : 'shapeTone',
      shapeId: template.id,
      shapeFamily: template.family,
      colorId: template.visual.colorId
    });
  }
  return placed;
}

/**
 * Named pentatonic boxes are the next shape family to enter this registry.
 * Legacy page coordinates are intentionally not treated as source data.
 */
export const SHAPE_TEMPLATES: readonly ShapeTemplate[] = [];
