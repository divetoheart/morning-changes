export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

export type SessionRecord = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  completedAt: string;
  kind: 'lesson' | 'daily';
};

export type PracticeProgress = {
  lessonStates: Record<string, LessonStatus>;
  completedDates: string[];
  history: SessionRecord[];
  tempo: number;
};

const STORAGE_KEY = 'morning-changes.production-progress.v1';

const fallback: PracticeProgress = {
  lessonStates: {},
  completedDates: [],
  history: [],
  tempo: 72
};

export function loadProgress(): PracticeProgress {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<PracticeProgress>;
    return {
      lessonStates: parsed.lessonStates ?? {},
      completedDates: parsed.completedDates ?? [],
      history: parsed.history ?? [],
      tempo: clampTempo(parsed.tempo ?? fallback.tempo)
    };
  } catch {
    return fallback;
  }
}

export function saveProgress(progress: PracticeProgress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function todayKey(date = new Date()) {
  return date.toLocaleDateString('en-CA');
}

export function clampTempo(value: number) {
  return Math.max(35, Math.min(240, Math.round(value)));
}

export function nextStatus(progress: PracticeProgress, lessonId: string): LessonStatus {
  return progress.lessonStates[lessonId] ?? 'not-started';
}

export function markStarted(progress: PracticeProgress, lessonId: string): PracticeProgress {
  if (nextStatus(progress, lessonId) === 'completed') return progress;
  return {
    ...progress,
    lessonStates: { ...progress.lessonStates, [lessonId]: 'in-progress' }
  };
}

export function markCompleted(
  progress: PracticeProgress,
  lesson: { id: string; title: string },
  kind: SessionRecord['kind'] = 'lesson'
): PracticeProgress {
  const completedAt = new Date().toISOString();
  const session: SessionRecord = {
    id: `${lesson.id}-${completedAt}`,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    completedAt,
    kind
  };

  return {
    ...progress,
    lessonStates: { ...progress.lessonStates, [lesson.id]: 'completed' },
    completedDates: kind === 'daily' && !progress.completedDates.includes(todayKey())
      ? [...progress.completedDates, todayKey()]
      : progress.completedDates,
    history: [...progress.history, session]
  };
}

export function currentStreak(progress: PracticeProgress) {
  const completed = new Set(progress.completedDates);
  const cursor = new Date();
  let count = 0;
  while (completed.has(todayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
