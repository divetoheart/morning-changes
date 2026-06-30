import { lessons, lessonById } from '../content/catalog';
import type { Lesson } from '../domain/content';

export type DailyExtra = {
  id: string;
  kind: 'Lick' | 'Exercise';
  title: string;
  durationMinutes: number;
  detail: string;
  tempo: number;
};

const dailyLicks: DailyExtra[] = [
  {
    id: 'guide-tone-slide',
    kind: 'Lick',
    title: 'Guide Tone Slide',
    durationMinutes: 5,
    detail: 'Slide Eb down to D as F7 becomes Bbmaj7.',
    tempo: 60
  },
  {
    id: 'minor-cadence-landing',
    kind: 'Lick',
    title: 'Minor Cadence Landing',
    durationMinutes: 4,
    detail: 'Let F# rise into G, then leave room around the resolution.',
    tempo: 62
  },
  {
    id: 'pentatonic-breath',
    kind: 'Lick',
    title: 'Pentatonic Breath',
    durationMinutes: 5,
    detail: 'Make one phrase, leave space, then answer with a variation.',
    tempo: 72
  }
];

const dailyExercises: DailyExtra[] = [
  {
    id: 'tempo-ladder',
    kind: 'Exercise',
    title: 'Tempo Ladder: Clean Eighth Notes',
    durationMinutes: 6,
    detail: 'Three clean repetitions before moving from 60 to 84 BPM.',
    tempo: 60
  },
  {
    id: 'chromatic-crossing',
    kind: 'Exercise',
    title: 'Chromatic String Crossing',
    durationMinutes: 6,
    detail: 'Keep every picked note even while crossing strings.',
    tempo: 56
  },
  {
    id: 'triad-change',
    kind: 'Exercise',
    title: 'Triad Change Drill',
    durationMinutes: 7,
    detail: 'Move only when the last shape feels easy and quiet.',
    tempo: 60
  }
];

function dailyIndex(length: number, date = new Date()) {
  const origin = new Date(2025, 0, 1);
  const days = Math.floor((date.getTime() - origin.getTime()) / 86_400_000);
  return ((days % length) + length) % length;
}

export function getDailyLesson(date = new Date()): Lesson {
  const eligible = lessons.filter(lesson => lesson.dailyEligible && lesson.access === 'free');
  const lesson = eligible[dailyIndex(eligible.length, date)];
  return lessonById(lesson.id) ?? eligible[0];
}

export function getDailyLick(date = new Date()) {
  return dailyLicks[dailyIndex(dailyLicks.length, date)];
}

export function getDailyExercise(date = new Date()) {
  return dailyExercises[dailyIndex(dailyExercises.length, date)];
}
