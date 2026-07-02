import { chordSymbol } from './harmony';
import { noteToString } from './pitch';
import type { Chord, IntervalName, SpelledNote } from './types';

export type VoiceLeadingMotion = {
  from: { interval: IntervalName; note: SpelledNote };
  to: { interval: IntervalName; note: SpelledNote };
  semitones: number;
  direction: 'hold' | 'up' | 'down';
};

const THIRD_INTERVALS: readonly IntervalName[] = ['3', 'b3'];
const SEVENTH_INTERVALS: readonly IntervalName[] = ['7', 'b7', 'bb7'];
const GUIDE_INTERVALS: readonly IntervalName[] = ['3', 'b3', '7', 'b7', 'bb7', '4', '2', '5'];

function toneFor(chord: Chord, intervals: readonly IntervalName[]) {
  return chord.tones.find(tone => intervals.includes(tone.interval));
}

function signedShortestDistance(from: SpelledNote, to: SpelledNote): number {
  const upward = (to.pitchClass - from.pitchClass + 12) % 12;
  if (upward === 0) return 0;
  return upward <= 6 ? upward : upward - 12;
}

function motion(from: { interval: IntervalName; note: SpelledNote }, to: { interval: IntervalName; note: SpelledNote }): VoiceLeadingMotion {
  const semitones = signedShortestDistance(from.note, to.note);
  return { from, to, semitones, direction: semitones === 0 ? 'hold' : semitones > 0 ? 'up' : 'down' };
}

function rootResolvesByFourth(from: Chord, to: Chord): boolean {
  return (to.root.pitchClass - from.root.pitchClass + 12) % 12 === 5;
}

function isDominant(chord: Chord) {
  return chord.tones.some(tone => tone.interval === '3') && chord.tones.some(tone => tone.interval === 'b7');
}

function isMinorSeventh(chord: Chord) {
  return chord.tones.some(tone => tone.interval === 'b3') && chord.tones.some(tone => tone.interval === 'b7');
}

function genericGuideToneMoves(from: Chord, to: Chord): VoiceLeadingMotion[] {
  const sources = from.tones.filter(tone => GUIDE_INTERVALS.includes(tone.interval)).slice(0, 2);
  const preferredTargets = to.tones.filter(tone => GUIDE_INTERVALS.includes(tone.interval) || tone.interval === '1');
  const targets = preferredTargets.length > 0 ? preferredTargets : to.tones;
  const used = new Set<number>();
  return sources.flatMap(source => {
    const candidate = targets
      .map((target, index) => ({ target, index, distance: Math.abs(signedShortestDistance(source.note, target.note)) }))
      .filter(item => !used.has(item.index))
      .sort((left, right) => left.distance - right.distance || left.index - right.index)[0];
    if (!candidate) return [];
    used.add(candidate.index);
    return [motion(source, candidate.target)];
  });
}

/**
 * Produces the two guide-tone motions worth hearing first. Conventional ii–V–I
 * behavior is explicit; unfamiliar changes fall back to nearest available guide tones.
 */
export function guideToneVoiceLeading(from: Chord, to: Chord): VoiceLeadingMotion[] {
  const dominantThird = toneFor(from, THIRD_INTERVALS);
  const dominantSeventh = toneFor(from, ['b7']);
  const targetRoot = toneFor(to, ['1']);
  const targetThird = toneFor(to, THIRD_INTERVALS);

  if (isDominant(from) && rootResolvesByFourth(from, to) && dominantThird && dominantSeventh && targetRoot && targetThird) {
    return [motion(dominantThird, targetRoot), motion(dominantSeventh, targetThird)];
  }

  const minorThird = toneFor(from, ['b3']);
  const minorSeventh = toneFor(from, ['b7']);
  const nextDominantThird = toneFor(to, ['3']);
  const nextDominantSeventh = toneFor(to, ['b7']);
  if (isMinorSeventh(from) && isDominant(to) && rootResolvesByFourth(from, to) && minorThird && minorSeventh && nextDominantThird && nextDominantSeventh) {
    return [motion(minorThird, nextDominantSeventh), motion(minorSeventh, nextDominantThird)];
  }

  return genericGuideToneMoves(from, to);
}

export function voiceLeadingSummary(from: Chord, to: Chord): string {
  const motions = guideToneVoiceLeading(from, to);
  if (motions.length === 0) return `No guide-tone path is available from ${chordSymbol(from)} to ${chordSymbol(to)}.`;
  return motions.map(item => `${item.from.interval} ${noteToString(item.from.note)} ${item.direction === 'hold' ? 'holds' : item.direction === 'up' ? 'moves up' : 'moves down'}${item.semitones === 0 ? '' : ` ${Math.abs(item.semitones)} semitone${Math.abs(item.semitones) === 1 ? '' : 's'}`} to ${item.to.interval} ${noteToString(item.to.note)}`).join(' · ');
}
