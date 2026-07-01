import { lessonById, paths } from './content/catalog';
import { nextStatus, type PracticeProgress } from './lib/progress';
import type { Lesson } from './domain/content';

type Props = {
  progress: PracticeProgress;
  activeLesson: Lesson;
  onOpenLesson: (lesson: Lesson) => void;
};

type Day = { key: string; label: string; minutes: number; isToday: boolean };

function dayKey(date: Date) {
  return date.toLocaleDateString('en-CA');
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function minutesForLesson(id: string) {
  return lessonById(id)?.durationMinutes ?? 0;
}

function recentWeek(progress: PracticeProgress): Day[] {
  const today = startOfDay(new Date());
  const totals = new Map<string, number>();
  progress.history.forEach(session => {
    const key = dayKey(new Date(session.completedAt));
    totals.set(key, (totals.get(key) ?? 0) + minutesForLesson(session.lessonId));
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = dayKey(date);
    return {
      key,
      label: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      minutes: totals.get(key) ?? 0,
      isToday: key === dayKey(today)
    };
  });
}

export function ProgressDashboard({ progress, activeLesson, onOpenLesson }: Props) {
  const days = recentWeek(progress);
  const weeklyMinutes = days.reduce((total, day) => total + day.minutes, 0);
  const peak = Math.max(...days.map(day => day.minutes), 1);
  const activePath = paths.find(path => path.lessonIds.includes(activeLesson.id)) ?? paths[0];
  const completed = activePath.lessonIds.filter(id => nextStatus(progress, id) === 'completed').length;
  const nextLesson = activePath.lessonIds.map(id => lessonById(id)).find(lesson => lesson && nextStatus(progress, lesson.id) !== 'completed') ?? activeLesson;

  return <section className="progress-dashboard">
    <div className="progress-dashboard-head">
      <div><span className="eyebrow">This week</span><h2>{weeklyMinutes} minutes of guitar</h2></div>
      <span className="weekly-count">{progress.history.filter(session => {
        const date = new Date(session.completedAt);
        return date >= new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      }).length} completed sessions</span>
    </div>

    <div className="weekly-bars" aria-label={`${weeklyMinutes} practice minutes this week`}>
      {days.map(day => <div key={day.key} className={day.isToday ? 'today' : ''}>
        <div className="weekly-bar-track"><span style={{ height: `${Math.max(8, (day.minutes / peak) * 100)}%` }} /></div>
        <strong>{day.label}</strong>
        <small>{day.minutes ? `${day.minutes}m` : '—'}</small>
      </div>)}
    </div>

    <div className="progress-next-grid">
      <article className="progress-path-card">
        <span className="eyebrow">Active path</span>
        <h3>{activePath.title}</h3>
        <div className="progress-line"><span style={{ width: `${Math.round((completed / activePath.lessonIds.length) * 100)}%` }} /></div>
        <small>{completed}/{activePath.lessonIds.length} lessons complete</small>
      </article>
      <article className="progress-next-card">
        <span className="eyebrow">Recommended next</span>
        <h3>{nextLesson.title}</h3>
        <p>{nextLesson.outcome}</p>
        <button className="secondary-button" type="button" onClick={() => onOpenLesson(nextLesson)}>Open next <span aria-hidden="true">→</span></button>
      </article>
    </div>
  </section>;
}
