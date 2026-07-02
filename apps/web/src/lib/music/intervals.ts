import type { ChordQuality, IntervalDefinition, IntervalName, ScaleMode } from './types';

export const INTERVALS: Record<IntervalName, IntervalDefinition> = {
  '1': { name: '1', semitones: 0, diatonicSteps: 0 },
  'b2': { name: 'b2', semitones: 1, diatonicSteps: 1 },
  '2': { name: '2', semitones: 2, diatonicSteps: 1 },
  '#2': { name: '#2', semitones: 3, diatonicSteps: 1 },
  'b3': { name: 'b3', semitones: 3, diatonicSteps: 2 },
  '3': { name: '3', semitones: 4, diatonicSteps: 2 },
  '4': { name: '4', semitones: 5, diatonicSteps: 3 },
  '#4': { name: '#4', semitones: 6, diatonicSteps: 3 },
  'b5': { name: 'b5', semitones: 6, diatonicSteps: 4 },
  '5': { name: '5', semitones: 7, diatonicSteps: 4 },
  '#5': { name: '#5', semitones: 8, diatonicSteps: 4 },
  'b6': { name: 'b6', semitones: 8, diatonicSteps: 5 },
  '6': { name: '6', semitones: 9, diatonicSteps: 5 },
  'bb7': { name: 'bb7', semitones: 9, diatonicSteps: 6 },
  'b7': { name: 'b7', semitones: 10, diatonicSteps: 6 },
  '7': { name: '7', semitones: 11, diatonicSteps: 6 },
  'b9': { name: 'b9', semitones: 1, diatonicSteps: 8 },
  '9': { name: '9', semitones: 2, diatonicSteps: 8 },
  '#9': { name: '#9', semitones: 3, diatonicSteps: 8 },
  '11': { name: '11', semitones: 5, diatonicSteps: 10 },
  '#11': { name: '#11', semitones: 6, diatonicSteps: 10 },
  'b13': { name: 'b13', semitones: 8, diatonicSteps: 12 },
  '13': { name: '13', semitones: 9, diatonicSteps: 12 }
};

export const SCALE_FORMULAS: Record<ScaleMode, readonly IntervalName[]> = {
  major: ['1', '2', '3', '4', '5', '6', '7'],
  naturalMinor: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
  harmonicMinor: ['1', '2', 'b3', '4', '5', 'b6', '7'],
  melodicMinor: ['1', '2', 'b3', '4', '5', '6', '7'],
  dorian: ['1', '2', 'b3', '4', '5', '6', 'b7'],
  phrygian: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
  lydian: ['1', '2', '3', '#4', '5', '6', '7'],
  mixolydian: ['1', '2', '3', '4', '5', '6', 'b7'],
  locrian: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
  lydianDominant: ['1', '2', '3', '#4', '5', '6', 'b7'],
  phrygianDominant: ['1', 'b2', '3', '4', '5', 'b6', 'b7'],
  altered: ['1', 'b2', '#2', '3', 'b5', 'b13', 'b7'],
  minorBlues: ['1', 'b3', '4', 'b5', '5', 'b7']
};

export type BuiltInChordQuality = Exclude<ChordQuality, 'custom'>;

export const CHORD_FORMULAS: Record<BuiltInChordQuality, readonly IntervalName[]> = {
  major: ['1', '3', '5'],
  minor: ['1', 'b3', '5'],
  dominant7: ['1', '3', '5', 'b7'],
  major7: ['1', '3', '5', '7'],
  minor7: ['1', 'b3', '5', 'b7'],
  halfDiminished7: ['1', 'b3', 'b5', 'b7'],
  diminished: ['1', 'b3', 'b5'],
  diminished7: ['1', 'b3', 'b5', 'bb7'],
  augmented: ['1', '3', '#5'],
  sus2: ['1', '2', '5'],
  sus4: ['1', '4', '5'],
  dominant7sus4: ['1', '4', '5', 'b7'],
  major6: ['1', '3', '5', '6'],
  minor6: ['1', 'b3', '5', '6'],
  major69: ['1', '3', '5', '6', '9'],
  minorMajor7: ['1', 'b3', '5', '7'],
  add9: ['1', '3', '5', '9'],
  add11: ['1', '3', '5', '11'],
  add13: ['1', '3', '5', '13'],
  dominant9: ['1', '3', '5', 'b7', '9'],
  dominant11: ['1', '3', '5', 'b7', '9', '11'],
  dominant13: ['1', '3', '5', 'b7', '9', '13'],
  dominant7b9: ['1', '3', '5', 'b7', 'b9'],
  dominant7Sharp9: ['1', '3', '5', 'b7', '#9'],
  dominant7Sharp11: ['1', '3', '5', 'b7', '#11'],
  dominant7Flat13: ['1', '3', '5', 'b7', 'b13'],
  major9: ['1', '3', '5', '7', '9'],
  major11: ['1', '3', '5', '7', '9', '11'],
  major13: ['1', '3', '5', '7', '9', '13'],
  minor9: ['1', 'b3', '5', 'b7', '9'],
  minor11: ['1', 'b3', '5', 'b7', '9', '11'],
  minor13: ['1', 'b3', '5', 'b7', '9', '13']
};

export function intervalDefinition(interval: IntervalName) {
  return INTERVALS[interval];
}
