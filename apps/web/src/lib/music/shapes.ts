import { fretPosition, STANDARD_TUNING } from './fretboard';
import { mod12, noteToString, parseNote, transposeNote } from './pitch';
import type { FretRange, IntervalName, PlacedShapeTone, ShapeTemplate, SpelledNote, StringTuning } from './types';

export type ShapeAnchor = {
  /** Low-to-high string index for the template's declared root anchor. */
  stringIndex: number;
  fret: number;
};

export type CagedMajorForm = 'C' | 'A' | 'G' | 'E' | 'D';
export type MinorPentatonicBox = 1 | 2 | 3 | 4 | 5;

type CagedParentGeometry = {
  /** The actual open-chord parent, before it is transposed to the chosen root. */
  openRoot: string;
  /** Low E to high e. Null means that parent shape does not sound that string. */
  frets: readonly (number | null)[];
  /** Low E to high e, aligned with frets. */
  intervals: readonly (IntervalName | null)[];
  colorId: string;
};

type PentatonicParentGeometry = {
  /** Fret positions relative to a minor root on the low E string. */
  cells: readonly { stringIndex: number; fretDelta: number; interval: IntervalName }[];
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

export type GeneratedMinorPentatonicBox = {
  box: MinorPentatonicBox;
  root: SpelledNote;
  tuningId: string;
  /** Low-E root location for this octave of the box. It can be outside the visible range. */
  rootAnchorFret: number;
  positions: readonly PlacedShapeTone[];
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

/**
 * Five standard-tuning minor-pentatonic parent geometries. Box boundaries share
 * notes by design; the renderer keeps both memberships instead of hiding one.
 */
export const MINOR_PENTATONIC_PARENT_GEOMETRIES: Readonly<Record<MinorPentatonicBox, PentatonicParentGeometry>> = {
  1: { colorId: 'pentatonic-1', cells: [
    { stringIndex:0, fretDelta:0, interval:'1' }, { stringIndex:0, fretDelta:3, interval:'b3' },
    { stringIndex:1, fretDelta:0, interval:'4' }, { stringIndex:1, fretDelta:2, interval:'5' },
    { stringIndex:2, fretDelta:0, interval:'b7' }, { stringIndex:2, fretDelta:2, interval:'1' },
    { stringIndex:3, fretDelta:0, interval:'b3' }, { stringIndex:3, fretDelta:2, interval:'4' },
    { stringIndex:4, fretDelta:0, interval:'5' }, { stringIndex:4, fretDelta:3, interval:'b7' },
    { stringIndex:5, fretDelta:0, interval:'1' }, { stringIndex:5, fretDelta:3, interval:'b3' }
  ] },
  2: { colorId: 'pentatonic-2', cells: [
    { stringIndex:0, fretDelta:3, interval:'b3' }, { stringIndex:0, fretDelta:5, interval:'4' },
    { stringIndex:1, fretDelta:2, interval:'5' }, { stringIndex:1, fretDelta:5, interval:'b7' },
    { stringIndex:2, fretDelta:2, interval:'1' }, { stringIndex:2, fretDelta:5, interval:'b3' },
    { stringIndex:3, fretDelta:2, interval:'4' }, { stringIndex:3, fretDelta:5, interval:'5' },
    { stringIndex:4, fretDelta:3, interval:'b7' }, { stringIndex:4, fretDelta:5, interval:'1' },
    { stringIndex:5, fretDelta:3, interval:'b3' }, { stringIndex:5, fretDelta:5, interval:'4' }
  ] },
  3: { colorId: 'pentatonic-3', cells: [
    { stringIndex:0, fretDelta:5, interval:'4' }, { stringIndex:0, fretDelta:7, interval:'5' },
    { stringIndex:1, fretDelta:5, interval:'b7' }, { stringIndex:1, fretDelta:7, interval:'1' },
    { stringIndex:2, fretDelta:5, interval:'b3' }, { stringIndex:2, fretDelta:7, interval:'4' },
    { stringIndex:3, fretDelta:4, interval:'5' }, { stringIndex:3, fretDelta:7, interval:'b7' },
    { stringIndex:4, fretDelta:5, interval:'1' }, { stringIndex:4, fretDelta:8, interval:'b3' },
    { stringIndex:5, fretDelta:5, interval:'4' }, { stringIndex:5, fretDelta:7, interval:'5' }
  ] },
  4: { colorId: 'pentatonic-4', cells: [
    { stringIndex:0, fretDelta:7, interval:'5' }, { stringIndex:0, fretDelta:10, interval:'b7' },
    { stringIndex:1, fretDelta:7, interval:'1' }, { stringIndex:1, fretDelta:10, interval:'b3' },
    { stringIndex:2, fretDelta:7, interval:'4' }, { stringIndex:2, fretDelta:9, interval:'5' },
    { stringIndex:3, fretDelta:7, interval:'b7' }, { stringIndex:3, fretDelta:9, interval:'1' },
    { stringIndex:4, fretDelta:8, interval:'b3' }, { stringIndex:4, fretDelta:10, interval:'4' },
    { stringIndex:5, fretDelta:7, interval:'5' }, { stringIndex:5, fretDelta:10, interval:'b7' }
  ] },
  5: { colorId: 'pentatonic-5', cells: [
    { stringIndex:0, fretDelta:10, interval:'b7' }, { stringIndex:0, fretDelta:12, interval:'1' },
    { stringIndex:1, fretDelta:9, interval:'b3' }, { stringIndex:1, fretDelta:12, interval:'4' },
    { stringIndex:2, fretDelta:9, interval:'5' }, { stringIndex:2, fretDelta:12, interval:'b7' },
    { stringIndex:3, fretDelta:9, interval:'1' }, { stringIndex:3, fretDelta:12, interval:'b3' },
    { stringIndex:4, fretDelta:10, interval:'4' }, { stringIndex:4, fretDelta:12, interval:'5' },
    { stringIndex:5, fretDelta:10, interval:'b7' }, { stringIndex:5, fretDelta:12, interval:'1' }
  ] }
};

export const CAGED_MAJOR_FORM_ORDER: readonly CagedMajorForm[] = ['C', 'A', 'G', 'E', 'D'];
export const MINOR_PENTATONIC_BOX_ORDER: readonly MinorPentatonicBox[] = [1, 2, 3, 4, 5];

function isStandardTuningGeometry(tuning: StringTuning) {
  return tuning.openMidi.length === STANDARD_TUNING.openMidi.length
    && tuning.openMidi.every((pitch, index) => pitch === STANDARD_TUNING.openMidi[index]);
}

function assertStandardShapeTuning(tuning: StringTuning, family: string) {
  if (!isStandardTuningGeometry(tuning)) {
    throw new Error(`${family} is currently defined for six-string standard tuning only. Use the general scale/chord engine for alternate tunings until a tuning-specific shape family is validated.`);
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
  assertStandardShapeTuning(tuning, 'CAGED major forms');
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

function rootAnchorsForRange(root: SpelledNote, tuning: StringTuning, range: FretRange): number[] {
  const rootAtLowE = mod12(root.pitchClass - tuning.openStrings[0].pitchClass);
  const minAnchor = range.start - 12;
  const maxAnchor = range.end;
  const minOctave = Math.ceil((minAnchor - rootAtLowE) / 12);
  const maxOctave = Math.floor((maxAnchor - rootAtLowE) / 12);
  return Array.from({ length: maxOctave - minOctave + 1 }, (_, index) => rootAtLowE + ((minOctave + index) * 12));
}

/**
 * Generates one minor-pentatonic box at a specific low-E root anchor. The anchor
 * may sit outside the visible range so a box can be cropped correctly at the nut
 * or at the top of a fretboard window.
 */
export function generateMinorPentatonicBox(
  box: MinorPentatonicBox,
  root: string | SpelledNote,
  rootAnchorFret: number,
  tuning: StringTuning = STANDARD_TUNING,
  range: FretRange = { start: 0, end: 15 }
): GeneratedMinorPentatonicBox {
  assertStandardShapeTuning(tuning, 'Minor pentatonic boxes');
  const rootNote = typeof root === 'string' ? parseNote(root) : root;
  const parent = MINOR_PENTATONIC_PARENT_GEOMETRIES[box];
  const positions = parent.cells.flatMap(cell => {
    const fret = rootAnchorFret + cell.fretDelta;
    if (fret < range.start || fret > range.end) return [];
    const position = fretPosition(tuning, cell.stringIndex, fret);
    const note = transposeNote(rootNote, cell.interval);
    if (position.pitchClass !== note.pitchClass) {
      throw new Error(`Minor pentatonic box ${box} mismatch for ${noteToString(rootNote)} on string ${cell.stringIndex}, fret ${fret}.`);
    }
    return [{
      ...position,
      interval: cell.interval,
      note,
      role: cell.interval === '1' ? 'root' : 'shapeTone',
      shapeId: `minor-pentatonic-box-${box}`,
      shapeFamily: 'pentatonic',
      colorId: parent.colorId
    } satisfies PlacedShapeTone];
  });
  return { box, root: rootNote, tuningId: tuning.id, rootAnchorFret, positions };
}

/**
 * Generates all five boxes across the supplied fret window. Adjacent boxes share
 * boundary tones intentionally; the layer resolver retains those memberships.
 */
export function generateMinorPentatonicCycle(
  root: string | SpelledNote,
  tuning: StringTuning = STANDARD_TUNING,
  range: FretRange = { start: 0, end: 15 }
): GeneratedMinorPentatonicBox[] {
  const rootNote = typeof root === 'string' ? parseNote(root) : root;
  return rootAnchorsForRange(rootNote, tuning, range).flatMap(rootAnchorFret => MINOR_PENTATONIC_BOX_ORDER.map(box => generateMinorPentatonicBox(box, rootNote, rootAnchorFret, tuning, range)));
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

/** Additional named shape families enter only after they have this same contract. */
export const SHAPE_TEMPLATES: readonly ShapeTemplate[] = [];
