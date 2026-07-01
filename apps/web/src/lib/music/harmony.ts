import { CHORD_FORMULAS, SCALE_FORMULAS } from './intervals';
import { noteToString, parseNote, transposeNote } from './pitch';
import type { Chord, ChordQuality, FunctionalChord, KeyContext, RomanDegree, ScaleMode, SpelledNote } from './types';

const DEGREE_INDEX: Record<RomanDegree, number> = {
  I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5, VII: 6,
  i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6
};

const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  major: '',
  minor: 'm',
  dominant7: '7',
  major7: 'maj7',
  minor7: 'm7',
  halfDiminished7: 'ø7',
  diminished: '°',
  diminished7: '°7',
  augmented: '+',
  sus2: 'sus2',
  sus4: 'sus4'
};

export function createKey(tonic: string | SpelledNote, mode: ScaleMode): KeyContext {
  return { tonic: typeof tonic === 'string' ? parseNote(tonic) : tonic, mode };
}

export function scaleIntervals(key: KeyContext) {
  return SCALE_FORMULAS[key.mode];
}

export function buildScale(key: KeyContext): Array<{ degree: number; interval: (typeof SCALE_FORMULAS)[ScaleMode][number]; note: SpelledNote }> {
  return SCALE_FORMULAS[key.mode].map((interval, index) => ({ degree: index + 1, interval, note: transposeNote(key.tonic, interval) }));
}

export function degreeNote(key: KeyContext, degree: RomanDegree): SpelledNote {
  return buildScale(key)[DEGREE_INDEX[degree]].note;
}

export function buildChord(root: string | SpelledNote, quality: ChordQuality): Chord {
  const rootNote = typeof root === 'string' ? parseNote(root) : root;
  return {
    root: rootNote,
    quality,
    tones: CHORD_FORMULAS[quality].map(interval => ({ interval, note: transposeNote(rootNote, interval) }))
  };
}

export function chordSymbol(chord: Chord): string {
  return `${noteToString(chord.root)}${QUALITY_SUFFIX[chord.quality]}`;
}

export function buildFunctionalChord(key: KeyContext, functional: FunctionalChord): Chord {
  return buildChord(degreeNote(key, functional.degree), functional.quality);
}

export function functionSymbol(functional: FunctionalChord): string {
  const quality = functional.quality;
  const suffix = quality === 'halfDiminished7' ? 'ø7'
    : quality === 'diminished' ? '°'
    : quality === 'diminished7' ? '°7'
    : quality === 'augmented' ? '+'
    : quality === 'dominant7' ? '7'
    : quality === 'major7' ? 'maj7'
    : quality === 'minor7' ? 'm7'
    : quality === 'major' ? ''
    : quality === 'minor' ? 'm'
    : quality;
  return `${functional.degree}${suffix}`;
}

export function relativeMajorKey(minorKey: KeyContext): KeyContext {
  if (!['naturalMinor', 'harmonicMinor', 'melodicMinor'].includes(minorKey.mode)) {
    throw new Error('Relative major can only be derived from a minor key context.');
  }
  return createKey(transposeNote(minorKey.tonic, 'b3'), 'major');
}

export function relativeMinorKey(majorKey: KeyContext): KeyContext {
  if (majorKey.mode !== 'major') throw new Error('Relative minor can only be derived from a major key context.');
  return createKey(transposeNote(majorKey.tonic, '6'), 'naturalMinor');
}
