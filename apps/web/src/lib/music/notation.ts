import type { Chord, FunctionalChord, IntervalName, KeyContext, MusicToken, SpelledNote } from './types';

export const music = {
  text(value: string): MusicToken { return { kind: 'text', value }; },
  key(key: KeyContext): MusicToken { return { kind: 'key', key }; },
  note(note: SpelledNote): MusicToken { return { kind: 'note', note }; },
  chord(chord: Chord): MusicToken { return { kind: 'chord', chord }; },
  function(functional: FunctionalChord): MusicToken { return { kind: 'function', function: functional }; },
  interval(interval: IntervalName): MusicToken { return { kind: 'interval', interval }; },
  fret(value: number): MusicToken { return { kind: 'fret', value }; },
  bar(value: number): MusicToken { return { kind: 'bar', value }; },
  string(value: string): MusicToken { return { kind: 'string', value }; }
} as const;

export function sentence(...tokens: MusicToken[]): MusicToken[] {
  return tokens;
}
