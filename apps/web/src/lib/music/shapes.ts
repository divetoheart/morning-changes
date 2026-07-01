import { fretPosition } from './fretboard';
import { transposeNote } from './pitch';
import type { FretRange, PlacedShapeTone, ShapeTemplate, SpelledNote, StringTuning } from './types';

export type ShapeAnchor = {
  /** Low-to-high string index for the template's declared root anchor. */
  stringIndex: number;
  fret: number;
};

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
 * Registry placeholder. CAGED and pentatonic templates will be added only after
 * individual validation; legacy coordinate arrays are intentionally not copied here.
 */
export const SHAPE_TEMPLATES: readonly ShapeTemplate[] = [];
