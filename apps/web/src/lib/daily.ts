import { lessons, lessonById } from '../content/catalog';
import type { KeyMode, Lesson, MusicInterval } from '../domain/content';
import type { FunctionalChord, MusicToken } from './music';

export type DailyExtra = {
  id: string;
  kind: 'Lick' | 'Exercise';
  title: string;
  durationMinutes: number;
  detail: string;
  tempo: number;
  keyMode: KeyMode;
  intervals: MusicInterval[];
  pattern: string | readonly MusicToken[];
  steps: Array<{ minutes: number; instruction: string }>;
  relatedLessonId?: string;
  afterHoursHref?: string;
  afterHoursCta?: string;
};

const text = (value: string): MusicToken => ({ kind: 'text', value });
const interval = (value: MusicInterval): MusicToken => ({ kind: 'interval', interval: value });
const functional = (degree: FunctionalChord['degree'], quality: FunctionalChord['quality'], context: FunctionalChord['context']): MusicToken => ({ kind: 'function', function: { degree, quality, context } });
const autumnLeavesBridge = { afterHoursHref: 'after-hours/autumn-leaves/', afterHoursCta: 'Apply it in Autumn Leaves' };

const dailyLicks: DailyExtra[] = [
  {
    id: 'guide-tone-slide', kind: 'Lick', title: 'Guide Tone Slide', durationMinutes: 5,
    detail: 'A two-note voice-leading lick that resolves the 7th of V7 down into the 3rd of Imaj7.', tempo: 60, keyMode: 'major', intervals: ['b7', '3'],
    pattern: [functional('V', 'dominant7', 'major'), text(': '), interval('b7'), text(' → '), functional('I', 'major7', 'major'), text(': '), interval('3')],
    steps: [{ minutes: 1, instruction: 'Find the b7 of V7 and the 3 of Imaj7 in one fretboard area.' }, { minutes: 2, instruction: 'Slide or move down by the smallest distance into the Imaj7 3rd.' }, { minutes: 1, instruction: 'Add a rest after the landing note.' }, { minutes: 1, instruction: 'Repeat in a new key without changing the interval idea.' }],
    relatedLessonId: 'guide-tones-major-ii-v-i', ...autumnLeavesBridge
  },
  {
    id: 'minor-cadence-landing', kind: 'Lick', title: 'Minor Cadence Landing', durationMinutes: 5,
    detail: 'A compact iiø–V–i ending: let the dominant 3rd resolve up to the minor root, then leave space.', tempo: 62, keyMode: 'natural-minor', intervals: ['3', '1', 'b3'],
    pattern: [functional('V', 'dominant7', 'minor'), text(': '), interval('3'), text(' → '), functional('i', 'minor', 'minor'), text(': '), interval('1'), text(' → '), interval('b3')],
    steps: [{ minutes: 1, instruction: 'Find the V7 3rd and the i root in the selected minor key.' }, { minutes: 2, instruction: 'Resolve the V7 3rd up by a half step into the tonic.' }, { minutes: 1, instruction: 'Add the minor 3rd after the root.' }, { minutes: 1, instruction: 'Play it once, then leave two beats of silence.' }],
    relatedLessonId: 'minor-ii-v-i-cadence', ...autumnLeavesBridge
  },
  {
    id: 'pentatonic-breath', kind: 'Lick', title: 'Pentatonic Breath', durationMinutes: 5,
    detail: 'A call-and-response phrase that makes the minor pentatonic feel like a sentence instead of a run.', tempo: 72, keyMode: 'natural-minor', intervals: ['1', 'b3', '4', '5', 'b7'],
    pattern: [text('Call: '), interval('1'), text(' '), interval('b3'), text(' '), interval('4'), text(' · rest · Answer: '), interval('5'), text(' '), interval('b3'), text(' '), interval('1')],
    steps: [{ minutes: 1, instruction: 'Play the three-note call: 1, b3, 4.' }, { minutes: 2, instruction: 'Leave one full bar of space before the answer.' }, { minutes: 1, instruction: 'Answer with 5, b3, 1.' }, { minutes: 1, instruction: 'Change one note in the answer while keeping the same rhythm.' }],
    relatedLessonId: 'triads-from-intervals'
  }
];

const dailyExercises: DailyExtra[] = [
  {
    id: 'tempo-ladder', kind: 'Exercise', title: 'Tempo Ladder: Clean Eighth Notes', durationMinutes: 6,
    detail: 'Build clean coordination in small steps: three accurate passes before you raise the tempo.', tempo: 60, keyMode: 'major', intervals: ['1', '2', '3', '4', '5'],
    pattern: [interval('1'), text(' '), interval('2'), text(' '), interval('3'), text(' '), interval('4'), text(' '), interval('5'), text(' · '), interval('5'), text(' '), interval('4'), text(' '), interval('3'), text(' '), interval('2'), text(' '), interval('1')],
    steps: [{ minutes: 2, instruction: 'Play the pattern at 60 BPM with strict alternate picking.' }, { minutes: 2, instruction: 'Move to 68 BPM only after three clean passes.' }, { minutes: 1, instruction: 'Move to 76 BPM and keep the motion small.' }, { minutes: 1, instruction: 'Return to 60 BPM and make it feel easy.' }],
    relatedLessonId: 'major-scale-intervals'
  },
  {
    id: 'chromatic-crossing', kind: 'Exercise', title: 'Chromatic String Crossing', durationMinutes: 6,
    detail: 'A picking-control drill that keeps the hand relaxed while moving between strings.', tempo: 56, keyMode: 'major', intervals: ['1', 'b2', '2', 'b3'],
    pattern: [interval('1'), text(' '), interval('b2'), text(' '), interval('2'), text(' '), interval('b3'), text(' across adjacent strings')],
    steps: [{ minutes: 2, instruction: 'Play four consecutive frets on one string with alternate picking.' }, { minutes: 2, instruction: 'Move the same shape to the next string without speeding up.' }, { minutes: 1, instruction: 'Cross two strings, then return.' }, { minutes: 1, instruction: 'Relax the picking hand before every repeat.' }],
    relatedLessonId: 'find-the-root'
  },
  {
    id: 'triad-change', kind: 'Exercise', title: 'Triad Change Drill', durationMinutes: 7,
    detail: 'Train the ear and hand to hear a major triad become minor by changing only the 3rd.', tempo: 60, keyMode: 'major', intervals: ['1', 'b3', '3', '5'],
    pattern: [interval('1'), text(' '), interval('3'), text(' '), interval('5'), text(' → '), interval('1'), text(' '), interval('b3'), text(' '), interval('5')],
    steps: [{ minutes: 2, instruction: 'Play 1 3 5 as a major triad.' }, { minutes: 2, instruction: 'Lower only 3 to b3.' }, { minutes: 2, instruction: 'Alternate major and minor every bar.' }, { minutes: 1, instruction: 'Change keys and repeat the same interval move.' }],
    relatedLessonId: 'triads-from-intervals'
  }
];

function dailyIndex(length: number, date = new Date()) { const origin = new Date(2025, 0, 1); const days = Math.floor((date.getTime() - origin.getTime()) / 86_400_000); return ((days % length) + length) % length; }
export function getDailyLesson(date = new Date()): Lesson { const eligible = lessons.filter(lesson => lesson.dailyEligible && lesson.access === 'free'); const lesson = eligible[dailyIndex(eligible.length, date)]; return lessonById(lesson.id) ?? eligible[0]; }
export function getDailyLick(date = new Date()) { return dailyLicks[dailyIndex(dailyLicks.length, date)]; }
export function getDailyExercise(date = new Date()) { return dailyExercises[dailyIndex(dailyExercises.length, date)]; }
export function findDailyExtra(kind: string | undefined, id: string | undefined) { const source = kind?.toLowerCase() === 'lick' ? dailyLicks : kind?.toLowerCase() === 'exercise' ? dailyExercises : []; return source.find(extra => extra.id === id); }