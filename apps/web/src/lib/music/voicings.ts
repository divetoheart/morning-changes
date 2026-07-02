import { intervalDefinition } from './intervals';
import { buildChord } from './harmony';
import { positionsForPitchClass, STANDARD_TUNING } from './fretboard';
import type {
  Chord,
  ChordQuality,
  FretRange,
  GeneratedVoicing,
  GuitarVoicingCandidate,
  IntervalName,
  IntervalPosition,
  StringTuning,
  VoicingRecipe,
  VoicingVoice
} from './types';

const DEFAULT_VOICING_RANGE: FretRange = { start: 0, end: 15 };

function voiceFor(chord: Chord, interval: IntervalName, relativeSemitones = intervalDefinition(interval).semitones): VoicingVoice {
  const tone = chord.tones.find(candidate => candidate.interval === interval);
  if (!tone) throw new Error(`${chord.quality} does not contain interval ${interval}.`);
  return { interval, note: tone.note, relativeSemitones };
}

function ascendingVoices(chord: Chord, intervals: readonly IntervalName[]): VoicingVoice[] {
  let previous = -Infinity;
  return intervals.map(interval => {
    let height = intervalDefinition(interval).semitones;
    while (height <= previous) height += 12;
    previous = height;
    return voiceFor(chord, interval, height);
  });
}

function closedVoicing(chord: Chord, inversion: 0 | 1 | 2 | 3): VoicingVoice[] {
  if (chord.tones.length !== 4) throw new Error(`Closed and drop-2 voicings currently require four notes; ${chord.quality} has ${chord.tones.length}.`);
  const intervals = chord.tones.map(tone => tone.interval);
  const rotated = [...intervals];
  for (let index = 0; index < inversion; index += 1) rotated.push(rotated.shift()!);
  return ascendingVoices(chord, rotated);
}

function drop2Voicing(chord: Chord, inversion: 0 | 1 | 2 | 3): VoicingVoice[] {
  const voices = closedVoicing(chord, inversion).map(voice => ({ ...voice }));
  const secondHighest = voices.length - 2;
  voices[secondHighest] = { ...voices[secondHighest], relativeSemitones: voices[secondHighest].relativeSemitones - 12 };
  return voices.sort((left, right) => left.relativeSemitones - right.relativeSemitones);
}

function shellVoicing(chord: Chord, options: Extract<VoicingRecipe, { kind: 'shell' }>): VoicingVoice[] {
  const third = chord.tones.find(tone => tone.interval === '3' || tone.interval === 'b3');
  const seventh = chord.tones.find(tone => tone.interval === '7' || tone.interval === 'b7' || tone.interval === 'bb7');
  if (!third || !seventh) throw new Error(`Shell voicings require a third and seventh; ${chord.quality} does not provide both.`);
  const fifth = chord.tones.find(tone => tone.interval === '5' || tone.interval === 'b5' || tone.interval === '#5');
  const guideTones = options.guideToneOrder === '7-3' ? [seventh.interval, third.interval] : [third.interval, seventh.interval];
  const intervals: IntervalName[] = [];
  if (options.includeRoot !== false) intervals.push('1');
  intervals.push(...guideTones);
  if (options.includeFifth && fifth) intervals.push(fifth.interval);
  return ascendingVoices(chord, intervals);
}

/** Generates theory-level voice order before any guitar placement occurs. */
export function generateVoicing(chord: Chord, recipe: VoicingRecipe): GeneratedVoicing {
  const voices = recipe.kind === 'shell'
    ? shellVoicing(chord, recipe)
    : recipe.kind === 'drop2'
      ? drop2Voicing(chord, recipe.inversion)
      : closedVoicing(chord, recipe.inversion);
  return { chord, recipe, voices };
}

export function generateVoicingFor(root: string, quality: ChordQuality, recipe: VoicingRecipe): GeneratedVoicing {
  return generateVoicing(buildChord(root, quality), recipe);
}

export type GuitarVoicingSearchOptions = {
  /** Low-to-high engine string indices, e.g. [2, 3, 4, 5] for D-G-B-e. */
  stringSet: readonly number[];
  tuning?: StringTuning;
  fretRange?: FretRange;
  maxFretSpan?: number;
  maxResults?: number;
};

export type GuitarVoicingSelectionOptions = Omit<GuitarVoicingSearchOptions, 'stringSet'> & {
  /** The candidate may use one of these explicitly requested low-to-high string sets. */
  stringSets: readonly (readonly number[])[];
  /** Optional target center fret. This is a preference, never a musical rule. */
  preferredFret?: number;
};

function assertStringSet(stringSet: readonly number[], voiceCount: number, tuning: StringTuning) {
  if (stringSet.length !== voiceCount) throw new Error(`Voicing has ${voiceCount} voices but string set has ${stringSet.length} strings.`);
  if (new Set(stringSet).size !== stringSet.length) throw new Error('String set cannot repeat a string.');
  if (stringSet.some((value, index) => index > 0 && value <= stringSet[index - 1])) throw new Error('String set must be ordered low to high.');
  if (stringSet.some(value => value < 0 || value >= tuning.openStrings.length)) throw new Error(`String set is outside ${tuning.id}.`);
}

/** Finds playable candidates while preserving intended low-to-high voice order. */
export function findGuitarVoicings(voicing: GeneratedVoicing, options: GuitarVoicingSearchOptions): GuitarVoicingCandidate[] {
  const tuning = options.tuning ?? STANDARD_TUNING;
  const fretRange = options.fretRange ?? DEFAULT_VOICING_RANGE;
  const maxFretSpan = options.maxFretSpan ?? 5;
  const maxResults = options.maxResults ?? 40;
  assertStringSet(options.stringSet, voicing.voices.length, tuning);

  const choices = voicing.voices.map((voice, index) => positionsForPitchClass(voice.note.pitchClass, tuning, fretRange)
    .filter(position => position.stringIndex === options.stringSet[index])
    .map(position => ({ ...position, interval: voice.interval, note: voice.note, role: voice.interval === '1' ? 'root' : 'chordTone' as const })));

  const results: GuitarVoicingCandidate[] = [];
  const visit = (voiceIndex: number, selected: IntervalPosition[]) => {
    if (results.length >= maxResults) return;
    if (voiceIndex === choices.length) {
      const frets = selected.map(position => position.fret);
      const fretSpan = Math.max(...frets) - Math.min(...frets);
      if (fretSpan <= maxFretSpan) results.push({ voicing, positions: selected, stringSet: options.stringSet, fretSpan });
      return;
    }
    const previousMidi = selected[selected.length - 1]?.midi ?? -Infinity;
    for (const candidate of choices[voiceIndex]) {
      if (candidate.midi <= previousMidi) continue;
      const next = [...selected, candidate];
      const frets = next.map(position => position.fret);
      if (Math.max(...frets) - Math.min(...frets) > maxFretSpan) continue;
      visit(voiceIndex + 1, next);
    }
  };

  visit(0, []);
  return results.sort((left, right) => {
    const leftLow = Math.min(...left.positions.map(position => position.fret));
    const rightLow = Math.min(...right.positions.map(position => position.fret));
    return leftLow - rightLow || left.fretSpan - right.fretSpan;
  });
}

/**
 * Picks one stable, playable candidate for a diagram or lesson card. It searches
 * only the caller's stated string sets, then prefers the requested neck area,
 * smaller spans, and lower positions in that order.
 */
export function selectGuitarVoicingCandidate(voicing: GeneratedVoicing, options: GuitarVoicingSelectionOptions): GuitarVoicingCandidate | undefined {
  const candidates = options.stringSets.flatMap(stringSet => findGuitarVoicings(voicing, { ...options, stringSet }));
  const preferredFret = options.preferredFret;
  return candidates.sort((left, right) => {
    const midpoint = (candidate: GuitarVoicingCandidate) => {
      const frets = candidate.positions.map(position => position.fret);
      return (Math.min(...frets) + Math.max(...frets)) / 2;
    };
    const leftDistance = preferredFret === undefined ? 0 : Math.abs(midpoint(left) - preferredFret);
    const rightDistance = preferredFret === undefined ? 0 : Math.abs(midpoint(right) - preferredFret);
    const leftLow = Math.min(...left.positions.map(position => position.fret));
    const rightLow = Math.min(...right.positions.map(position => position.fret));
    return leftDistance - rightDistance || left.fretSpan - right.fretSpan || leftLow - rightLow;
  })[0];
}