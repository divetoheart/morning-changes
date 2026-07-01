import { intervalDefinition } from './intervals';
import type { AccidentalOffset, IntervalName, LetterName, PitchClass, SpelledNote } from './types';

const LETTERS: readonly LetterName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_PITCH_CLASS: Record<LetterName, PitchClass> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const GLYPH_TO_OFFSET: Record<string, AccidentalOffset> = { '': 0, b: -1, '♭': -1, bb: -2, '♭♭': -2, '#': 1, '♯': 1, '##': 2, '♯♯': 2 };

export function mod12(value: number): PitchClass {
  return ((value % 12) + 12) % 12;
}

export function accidentalGlyph(offset: AccidentalOffset): string {
  if (offset === 0) return '';
  if (offset > 0) return '♯'.repeat(offset);
  return '♭'.repeat(Math.abs(offset));
}

export function noteToString(note: SpelledNote): string {
  return `${note.letter}${accidentalGlyph(note.accidental)}`;
}

export function makeNote(letter: LetterName, accidental: AccidentalOffset = 0): SpelledNote {
  return { letter, accidental, pitchClass: mod12(NATURAL_PITCH_CLASS[letter] + accidental) };
}

export function parseNote(input: string): SpelledNote {
  const match = input.trim().match(/^([A-Ga-g])((?:bb|##|♭♭|♯♯|b|#|♭|♯)?)$/);
  if (!match) throw new Error(`Unsupported note spelling: ${input}`);
  const letter = match[1].toUpperCase() as LetterName;
  const accidental = GLYPH_TO_OFFSET[match[2] ?? ''];
  if (accidental === undefined) throw new Error(`Unsupported accidental: ${match[2]}`);
  return makeNote(letter, accidental);
}

export function samePitch(left: SpelledNote, right: SpelledNote): boolean {
  return left.pitchClass === right.pitchClass;
}

/**
 * Spells the target by preserving the interval's diatonic letter distance.
 * Example: B + b3 is D, while B + 3 is D♯; B♭ + 3 is D.
 */
export function transposeNote(root: SpelledNote, interval: IntervalName): SpelledNote {
  const definition = intervalDefinition(interval);
  const rootIndex = LETTERS.indexOf(root.letter);
  const targetLetter = LETTERS[(rootIndex + definition.diatonicSteps) % LETTERS.length];
  const targetPitchClass = mod12(root.pitchClass + definition.semitones);
  const naturalPitchClass = NATURAL_PITCH_CLASS[targetLetter];
  let accidental = mod12(targetPitchClass - naturalPitchClass);
  if (accidental > 6) accidental -= 12;
  if (accidental < -3 || accidental > 3) {
    throw new Error(`Cannot spell ${noteToString(root)} + ${interval} without a triple accidental.`);
  }
  return makeNote(targetLetter, accidental as AccidentalOffset);
}

export function pitchClassLabel(pitchClass: PitchClass, preference: 'flats' | 'sharps' = 'flats'): SpelledNote {
  const flatNames = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  const sharpNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  return parseNote((preference === 'flats' ? flatNames : sharpNames)[mod12(pitchClass)]);
}
