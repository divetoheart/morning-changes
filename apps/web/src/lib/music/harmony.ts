import { CHORD_FORMULAS, SCALE_FORMULAS, type BuiltInChordQuality } from './intervals';
import { noteToString, parseNote, transposeNote } from './pitch';
import type { Chord, ChordQuality, FunctionalChord, IntervalName, KeyContext, RomanDegree, ScaleMode, SpelledNote, Triad, TriadQuality, TriadTone } from './types';

const DEGREE_INDEX: Record<RomanDegree, number> = {
  I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5, VII: 6,
  i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6
};

const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  major: '', minor: 'm', dominant7: '7', major7: 'maj7', minor7: 'm7', halfDiminished7: 'ø7', diminished: '°', diminished7: '°7', augmented: '+', sus2: 'sus2', sus4: 'sus4', custom: ''
};

const QUALITY_FROM_SUFFIX: ReadonlyArray<readonly [string, BuiltInChordQuality]> = [
  ['m7♭5', 'halfDiminished7'], ['m7b5', 'halfDiminished7'], ['ø7', 'halfDiminished7'], ['ø', 'halfDiminished7'],
  ['dim7', 'diminished7'], ['°7', 'diminished7'], ['dim', 'diminished'], ['°', 'diminished'],
  ['aug', 'augmented'], ['+', 'augmented'], ['sus4', 'sus4'], ['sus2', 'sus2'],
  ['maj7', 'major7'], ['M7', 'major7'], ['m7', 'minor7'], ['7', 'dominant7'], ['maj', 'major'], ['m', 'minor'], ['', 'major']
];

const TRIAD_QUALITY_BY_CHORD: Readonly<Partial<Record<ChordQuality, TriadQuality>>> = {
  major: 'major', major7: 'major', dominant7: 'major', minor: 'minor', minor7: 'minor', halfDiminished7: 'diminished', diminished: 'diminished', diminished7: 'diminished', augmented: 'augmented'
};
const TRIAD_INTERVALS = new Set<TriadTone['interval']>(['1', 'b3', '3', 'b5', '5', '#5']);

export function chordQualitySuffix(quality: ChordQuality): string { return QUALITY_SUFFIX[quality]; }

/** Roman-numeral case already carries basic major/minor quality. */
export function functionQualitySuffix(quality: ChordQuality): string {
  if (quality === 'major' || quality === 'minor') return '';
  if (quality === 'minor7') return '7';
  if (quality === 'custom') return 'custom';
  return chordQualitySuffix(quality);
}

export function chordQualityFromSuffix(value: string): BuiltInChordQuality {
  const normalized = value.trim().replace('m7b5', 'm7♭5');
  const match = QUALITY_FROM_SUFFIX.find(([suffix]) => suffix === normalized);
  if (!match) throw new Error(`Unsupported chord quality suffix: ${value}`);
  return match[1];
}

/** Structured text entry for the Fretboard chord builder. */
export function parseChordSymbol(value: string): Chord {
  const match = value.trim().match(/^([A-G](?:♭|♯|bb|##|b|#)?)(.*)$/);
  if (!match) throw new Error(`Unsupported chord symbol: ${value}`);
  return buildChord(parseNote(match[1]), chordQualityFromSuffix(match[2] ?? ''));
}

export function createKey(tonic: string | SpelledNote, mode: ScaleMode): KeyContext { return { tonic: typeof tonic === 'string' ? parseNote(tonic) : tonic, mode }; }
export function scaleIntervals(key: KeyContext) { return SCALE_FORMULAS[key.mode]; }
export function buildScale(key: KeyContext): Array<{ degree: number; interval: (typeof SCALE_FORMULAS)[ScaleMode][number]; note: SpelledNote }> { return SCALE_FORMULAS[key.mode].map((interval, index) => ({ degree: index + 1, interval, note: transposeNote(key.tonic, interval) })); }
export function degreeNote(key: KeyContext, degree: RomanDegree): SpelledNote { return buildScale(key)[DEGREE_INDEX[degree]].note; }

export function buildChord(root: string | SpelledNote, quality: BuiltInChordQuality): Chord {
  const rootNote = typeof root === 'string' ? parseNote(root) : root;
  return { root: rootNote, quality, tones: CHORD_FORMULAS[quality].map(interval => ({ interval, note: transposeNote(rootNote, interval) })) };
}

/** Builds an engine-backed chord from the exact interval buttons selected by the user. */
export function buildCustomChord(root: string | SpelledNote, intervals: readonly IntervalName[]): Chord {
  const rootNote = typeof root === 'string' ? parseNote(root) : root;
  const unique = intervals.filter((interval, index) => intervals.indexOf(interval) === index);
  if (!unique.includes('1')) throw new Error('A custom chord must include its root (1).');
  if (unique.length < 2) throw new Error('A custom chord needs at least one tone beyond the root.');
  return {
    root: rootNote,
    quality: 'custom',
    tones: unique.map(interval => ({ interval, note: transposeNote(rootNote, interval) })),
    label: `${noteToString(rootNote)} [${unique.join(' ')}]`
  };
}

/** Builds a correctly spelled major, minor, diminished, or augmented three-tone chord. */
export function buildTriad(root: string | SpelledNote, quality: TriadQuality): Triad {
  const chord = buildChord(root, quality);
  if (chord.tones.length !== 3) throw new Error(`${quality} is not a three-tone chord.`);
  const tones: TriadTone[] = chord.tones.map(tone => {
    if (!TRIAD_INTERVALS.has(tone.interval as TriadTone['interval'])) throw new Error(`${quality} contains a non-triad interval: ${tone.interval}.`);
    return { interval: tone.interval as TriadTone['interval'], note: tone.note };
  });
  const [rootTone, thirdTone, fifthTone] = tones;
  if (!rootTone || !thirdTone || !fifthTone) throw new Error(`${quality} did not resolve to three tones.`);
  return { root: chord.root, quality, tones: [rootTone, thirdTone, fifthTone] };
}

/** Reduces a supported chord quality to its underlying tertian three-tone quality. */
export function triadQualityForChord(quality: ChordQuality): TriadQuality | undefined { return TRIAD_QUALITY_BY_CHORD[quality]; }

function customTriadQuality(chord: Chord): TriadQuality | undefined {
  const intervals = new Set(chord.tones.map(tone => tone.interval));
  if (!intervals.has('1')) return undefined;
  if (intervals.has('3') && intervals.has('#5')) return 'augmented';
  if (intervals.has('b3') && intervals.has('b5')) return 'diminished';
  if (intervals.has('b3') && intervals.has('5')) return 'minor';
  if (intervals.has('3') && intervals.has('5')) return 'major';
  return undefined;
}

export function triadForChord(chord: Chord): Triad | undefined {
  const quality = chord.quality === 'custom' ? customTriadQuality(chord) : triadQualityForChord(chord.quality);
  return quality ? buildTriad(chord.root, quality) : undefined;
}

export function chordSymbol(chord: Chord): string { return chord.label ?? `${noteToString(chord.root)}${chordQualitySuffix(chord.quality)}`; }
export function buildFunctionalChord(key: KeyContext, functional: FunctionalChord): Chord {
  if (functional.quality === 'custom') throw new Error('Functional chords cannot use the custom quality.');
  return buildChord(degreeNote(key, functional.degree), functional.quality);
}
export function functionSymbol(functional: FunctionalChord): string { return `${functional.degree}${functionQualitySuffix(functional.quality)}`; }

export function relativeMajorKey(minorKey: KeyContext): KeyContext {
  if (!['naturalMinor', 'harmonicMinor', 'melodicMinor'].includes(minorKey.mode)) throw new Error('Relative major can only be derived from a minor key context.');
  return createKey(transposeNote(minorKey.tonic, 'b3'), 'major');
}
export function relativeMinorKey(majorKey: KeyContext): KeyContext {
  if (majorKey.mode !== 'major') throw new Error('Relative minor can only be derived from a major key context.');
  return createKey(transposeNote(majorKey.tonic, '6'), 'naturalMinor');
}
