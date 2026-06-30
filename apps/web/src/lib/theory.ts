import type { HarmonyExample, KeyMode, MusicInterval } from '../domain/content';

export const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
export type KeyName = typeof KEYS[number];

const CHROMATIC = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const INTERVALS: Record<MusicInterval, number> = {
  '1': 0,
  'b2': 1,
  '2': 2,
  '#2': 3,
  'b3': 3,
  '3': 4,
  '4': 5,
  '#4': 6,
  'b5': 6,
  '5': 7,
  '#5': 8,
  'b6': 8,
  '6': 9,
  'bb7': 9,
  'b7': 10,
  '7': 11
};

export const MODE_INTERVALS: Record<KeyMode, MusicInterval[]> = {
  major: ['1', '2', '3', '4', '5', '6', '7'],
  'natural-minor': ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
  'harmonic-minor': ['1', '2', 'b3', '4', '5', 'b6', '7']
};

export function randomKey(seed = new Date().toDateString()): KeyName {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 100000;
  return KEYS[hash % KEYS.length];
}

export function transpose(key: KeyName, interval: MusicInterval): string {
  const root = CHROMATIC.indexOf(key);
  if (root < 0) return key;
  return CHROMATIC[(root + INTERVALS[interval] + 12) % 12];
}

export function renderIntervals(key: KeyName, intervals: MusicInterval[]) {
  return intervals.map(interval => ({ interval, note: transpose(key, interval) }));
}

export function chordName(key: KeyName, example: HarmonyExample) {
  const root = transpose(key, example.rootDegree);
  const quality = example.quality === 'maj' ? '' : example.quality === 'm' ? 'm' : example.quality;
  return `${root}${quality}`;
}

export function chordTones(key: KeyName, example: HarmonyExample) {
  const root = transpose(key, example.rootDegree) as KeyName;
  return renderIntervals(root, example.intervals);
}

export function modeNotes(key: KeyName, mode: KeyMode) {
  return renderIntervals(key, MODE_INTERVALS[mode]);
}

export function labelMode(mode: KeyMode) {
  if (mode === 'natural-minor') return 'natural minor';
  if (mode === 'harmonic-minor') return 'harmonic minor';
  return 'major';
}
