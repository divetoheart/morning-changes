import { buildChord, buildScale } from './harmony';
import { mod12, parseNote, transposeNote } from './pitch';
import type { Chord, FretPosition, FretRange, IntervalName, IntervalPosition, KeyContext, SpelledNote, StringTuning } from './types';

export const STANDARD_TUNING: StringTuning = {
  id: 'standard',
  label: 'Standard tuning',
  /** Low E to high e. UI can reverse this to draw high e at the top. */
  openStrings: [parseNote('E'), parseNote('A'), parseNote('D'), parseNote('G'), parseNote('B'), parseNote('E')]
};

export const DEFAULT_FRET_RANGE: FretRange = { start: 0, end: 15 };

export function fretPosition(tuning: StringTuning, stringIndex: number, fret: number): FretPosition {
  const openString = tuning.openStrings[stringIndex];
  if (!openString) throw new Error(`String index ${stringIndex} does not exist in ${tuning.id}.`);
  if (fret < 0 || !Number.isInteger(fret)) throw new Error(`Invalid fret: ${fret}`);
  return { stringIndex, fret, pitchClass: mod12(openString.pitchClass + fret) };
}

export function allFretPositions(tuning: StringTuning = STANDARD_TUNING, range: FretRange = DEFAULT_FRET_RANGE): FretPosition[] {
  const positions: FretPosition[] = [];
  for (let stringIndex = 0; stringIndex < tuning.openStrings.length; stringIndex += 1) {
    for (let fret = range.start; fret <= range.end; fret += 1) positions.push(fretPosition(tuning, stringIndex, fret));
  }
  return positions;
}

export function positionsForPitchClass(pitchClass: number, tuning: StringTuning = STANDARD_TUNING, range: FretRange = DEFAULT_FRET_RANGE): FretPosition[] {
  return allFretPositions(tuning, range).filter(position => position.pitchClass === mod12(pitchClass));
}

export function positionsForIntervals(
  root: SpelledNote,
  intervals: readonly IntervalName[],
  role: IntervalPosition['role'],
  tuning: StringTuning = STANDARD_TUNING,
  range: FretRange = DEFAULT_FRET_RANGE
): IntervalPosition[] {
  return intervals.flatMap(interval => {
    const note = transposeNote(root, interval);
    return positionsForPitchClass(note.pitchClass, tuning, range).map(position => ({ ...position, interval, note, role }));
  });
}

export function positionsForChord(chord: Chord, tuning: StringTuning = STANDARD_TUNING, range: FretRange = DEFAULT_FRET_RANGE): IntervalPosition[] {
  return chord.tones.flatMap(tone => positionsForIntervals(chord.root, [tone.interval], tone.interval === '1' ? 'root' : 'chordTone', tuning, range));
}

export function positionsForScale(key: KeyContext, tuning: StringTuning = STANDARD_TUNING, range: FretRange = DEFAULT_FRET_RANGE): IntervalPosition[] {
  return buildScale(key).flatMap(degree => positionsForIntervals(key.tonic, [degree.interval], degree.interval === '1' ? 'root' : 'scaleTone', tuning, range));
}

export function positionsForChordSymbol(root: string, quality: Parameters<typeof buildChord>[1], tuning: StringTuning = STANDARD_TUNING, range: FretRange = DEFAULT_FRET_RANGE): IntervalPosition[] {
  return positionsForChord(buildChord(root, quality), tuning, range);
}

/** Maps engine string indices to visual rows: high e first, low E last. */
export function displayStringOrder(tuning: StringTuning = STANDARD_TUNING): number[] {
  return tuning.openStrings.map((_, index) => index).reverse();
}
