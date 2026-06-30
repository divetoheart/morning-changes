import { useEffect, useMemo, useState } from 'react';
import { HashRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { getDailyExercise, getDailyLesson, getDailyLick, type DailyExtra } from './lib/daily';
import { clampTempo, currentStreak, loadProgress, markCompleted, markStarted, nextStatus, saveProgress, type PracticeProgress } from './lib/progress';
import { useMetronome } from './lib/useMetronome';
import { lessonById, lessons, pathById, paths, standards } from './content/catalog';
import type { Lesson, LearningPath } from './domain/content';

type Overlay =
  | { kind: 'daily' }
  | { kind: 'lesson'; lesson: Lesson }
  | { kind: 'path'; path: LearningPath }
  | { kind: 'extra'; extra: DailyExtra }
  | { kind: 'premium'; title?: string }
  | { kind: 'tuner' }
  | null;

type IconName = 'home' | 'learn' | 'paths' | 'after' | 'tools' | 'progress' | 'play' | 'tempo' | 'close' | 'arrow' | 'lock';

const navItems = [
  { to: '/', label: 'Home', icon: 'home' as IconName, end: true },
  { to: '/learn', label: 'Learn', icon: 'learn' as IconName },
  { to: '/paths', label: 'Paths', icon: 'paths' as IconName },
  { to: '/after-hours', label: 'After', icon: 'after' as IconName },
  { to: '/tools', label: 'Tools', icon: 'tools' as IconName },
  { to: '/progress', label: 'Progress', icon: 'progress' as IconName }
];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'home') return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></svg>;
  if (name === 'learn') return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" /><path d="M4 5.5V21.5" /><path d="M8 7h8M8 11h8" /></svg>;
  if (name === 'paths') return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m15.5 8.5-2.1 5-4.8 2.1 2.1-4.8Z" /></svg>;
  if (name === 'after') return <svg {...common}><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>;
  if (name === 'tools') return <svg {...common}><path d="M4 4v16M20 4v16M4 8h5M15 8h5M4 16h9M17 16h3" /><circle cx="11" cy="8" r="2" /><circle cx="15" cy="16" r="2" /></svg>;
  if (name === 'progress') return <svg {...common}><path d="M4 19V5M4 19h16" /><path d="m7 15 4-4 3 2 5-6" /><path d="M16 7h3v3" /></svg>;
  if (name === 'play') return <svg {...common}><path d="m8 5 11 7-11 7Z" /></svg>;
  if (name === 'tempo') return <svg {...common}><path d="M12 3v18" /><path d="M7 7h10M7 17h10" /><path d="M8 7 5 17h14l-3-10" /></svg>;
  if (name === 'close') return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
  return <svg {...common}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="m8 11 2.5 2.5L16 8" /></svg>;
}

function statusLabel(status: ReturnType<typeof nextStatus>) {
  if (status === 'completed') return 'Completed';
  if (status === 'in-progress') return 'In progress';
  return 'New';
}

function accessLabel(access: Lesson['access']) {
  return access === 'premium' ? 'Premium' : 'Free';
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<PracticeProgress>(() => loadProgress());
  const [overlay, setOverlay] = useState<Overlay>(null);
  const metronome = useMetronome(progress.tempo, tempo => {
    setProgress(previous => ({ ...previous, tempo: clampTempo(tempo) }));
  });

  useEffect(() => saveProgress(progress), [progress]);

  const dailyLesson = useMemo(() => getDailyLesson(), []);
  const dailyLick = useMemo(() => getDailyLick(), []);
  const dailyExercise = useMemo(() => getDailyExercise(), []);
  const activeLesson = lessons.find(lesson => nextStatus(progress, lesson.id) === 'in-progress') ?? dailyLesson;

  const openLesson = (lesson: Lesson) => {
    if (lesson.access === 'premium') {
      setOverlay({ kind: 'premium', title: lesson.title });
      return;
    }
    setOverlay({ kind: 'lesson', lesson });
  };

  const startLesson = (lesson: Lesson) => {
    setProgress(previous => markStarted(previous, lesson.id));
    metronome.setTempo(lesson.metronome.bpm);
  };

  const completeLesson = (lesson: Lesson, daily = false) => {
    setProgress(previous => markCompleted(previous, lesson, daily ? 'daily' : 'lesson'));
    setOverlay(null);
  };

  const openPath = (path: LearningPath) => {
    if (path.access === 'premium') {
      setOverlay({ kind: 'premium', title: path.title });
      return;
    }
    setOverlay({ kind: 'path', path });
  };

  return <div className="app-shell">
    <header className="app-topbar">
      <NavLink className="wordmark" to="/" aria-label="Morning Changes home">
        <span className="wordmark-mark">◒</span>
        <span>
          <strong>Morning Changes</strong>
          <small>Daily guitar practice</small>
        </span>
      </NavLink>
      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'active' : ''}>{item.label}</NavLink>)}
      </nav>
      <button className="tempo-button" type="button" onClick={metronome.toggle} aria-label={metronome.playing ? 'Stop metronome' : 'Start metronome'}>
        <Icon name="tempo" size={16} /> {metronome.tempo}
      </button>
    </header>

    <main className="screen">
      <Routes>
        <Route path="/" element={<HomeScreen dailyLesson={dailyLesson} dailyLick={dailyLick} dailyExercise={dailyExercise} activeLesson={activeLesson} progress={progress} onOpenDaily={() => setOverlay({ kind: 'daily' })} onOpenLesson={openLesson} onOpenExtra={extra => setOverlay({ kind: 'extra', extra })} />} />
        <Route path="/learn" element={<LearnScreen progress={progress} activeLesson={activeLesson} onOpenLesson={openLesson} />} />
        <Route path="/paths" element={<PathsScreen progress={progress} onOpenPath={openPath} />} />
        <Route path="/after-hours" element={<AfterHoursScreen onOpenPremium={title => setOverlay({ kind: 'premium', title })} />} />
        <Route path="/tools" element={<ToolsScreen metronome={metronome} onOpenTuner={() => setOverlay({ kind: 'tuner' })} />} />
        <Route path="/progress" element={<ProgressScreen progress={progress} activeLesson={activeLesson} onOpenLesson={openLesson} />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </main>

    <nav className="bottom-nav" aria-label="Mobile navigation">
      {navItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'active' : ''}><Icon name={item.icon} size={19} /><span>{item.label}</span></NavLink>)}
    </nav>

    {overlay && <PracticeOverlay
      overlay={overlay}
      progress={progress}
      metronome={metronome}
      onClose={() => setOverlay(null)}
      onStart={startLesson}
      onComplete={completeLesson}
      onOpenLesson={lesson => { setOverlay(null); openLesson(lesson); }}
      onNavigate={path => { setOverlay(null); navigate(path); }}
    />}
  </div>;
}

function ScreenHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <section className="screen-header">
    <span className="eyebrow">{eyebrow}</span>
    <h1>{title}</h1>
    {copy && <p>{copy}</p>}
  </section>;
}

function HomeScreen({ dailyLesson, dailyLick, dailyExercise, activeLesson, progress, onOpenDaily, onOpenLesson, onOpenExtra }: {
  dailyLesson: Lesson;
  dailyLick: DailyExtra;
  dailyExercise: DailyExtra;
  activeLesson: Lesson;
  progress: PracticeProgress;
  onOpenDaily: () => void;
  onOpenLesson: (lesson: Lesson) => void;
  onOpenExtra: (extra: DailyExtra) => void;
}) {
  const activePath = paths.find(path => path.lessonIds.includes(activeLesson.id));
  const done = activePath?.lessonIds.filter(id => nextStatus(progress, id) === 'completed').length ?? 0;
  return <>
    <ScreenHeader eyebrow="Today" title="Ready when you are." />
    <section className="focus-session">
      <div>
        <span className="eyebrow">Today’s practice · {dailyLesson.durationMinutes} min</span>
        <h2>{dailyLesson.title}</h2>
        <p>{dailyLesson.outcome}</p>
        <div className="focus-meta"><span>{dailyLesson.durationMinutes} min</span><span>{statusLabel(nextStatus(progress, dailyLesson.id))}</span></div>
      </div>
      <button className="primary-button focus-action" type="button" onClick={onOpenDaily}><Icon name="play" size={16} /> Start session</button>
    </section>

    <section className="quiet-list" aria-label="Keep going">
      <span className="list-heading">Keep going</span>
      <CompactRow icon="paths" label={`${activePath?.title ?? 'Practice path'} · ${done}/${activePath?.lessonIds.length ?? 0}`} title={activeLesson.title} detail="Continue where you left off." action="Open" onClick={() => onOpenLesson(activeLesson)} />
      <CompactRow icon="after" label={`Daily lick · ${dailyLick.durationMinutes} min`} title={dailyLick.title} detail={dailyLick.detail} action="Open" onClick={() => onOpenExtra(dailyLick)} />
      <CompactRow icon="tools" label={`Daily exercise · ${dailyExercise.durationMinutes} min`} title={dailyExercise.title} detail={dailyExercise.detail} action="Open" onClick={() => onOpenExtra(dailyExercise)} />
      <a className="compact-row row-link" href="../after-hours/autumn-leaves/">
        <span className="row-icon"><Icon name="after" /></span>
        <span className="row-content"><span className="row-label">After Hours</span><strong>Autumn Leaves</strong><small>Pick up the A section whenever you are ready.</small></span>
        <span className="row-action">Open <Icon name="arrow" size={16} /></span>
      </a>
    </section>
  </>;
}

function LearnScreen({ progress, activeLesson, onOpenLesson }: { progress: PracticeProgress; activeLesson: Lesson; onOpenLesson: (lesson: Lesson) => void }) {
  const section = (title: string, copy: string, selection: Lesson[]) => <section className="catalog-section" key={title}>
    <div className="catalog-heading"><h2>{title}</h2><p>{copy}</p></div>
    <div className="lesson-rail">{selection.map(lesson => <LessonCard key={lesson.id} lesson={lesson} status={nextStatus(progress, lesson.id)} onOpen={() => onOpenLesson(lesson)} />)}</div>
  </section>;

  return <>
    <ScreenHeader eyebrow="Learn" title="Pick a lane." copy="Swipe through a section, then open the one that feels useful today." />
    <section className="continue-card"><CompactRow icon="play" label="Continue" title={activeLesson.title} detail={`${statusLabel(nextStatus(progress, activeLesson.id))} · ${activeLesson.durationMinutes} min`} action="Open" onClick={() => onOpenLesson(activeLesson)} /></section>
    {section('Start here', 'Short sessions with no setup.', lessons.filter(lesson => lesson.access === 'free' && lesson.dailyEligible))}
    {section('Beginner', 'Rhythm, fretboard, chords, and first phrases.', lessons.filter(lesson => lesson.level === 'Beginner'))}
    {section('Intermediate', 'Move through harmony with confidence.', lessons.filter(lesson => lesson.level === 'Intermediate'))}
    {section('Advanced', 'Color, control, and deeper language.', lessons.filter(lesson => lesson.level === 'Advanced'))}
  </>;
}

function PathsScreen({ progress, onOpenPath }: { progress: PracticeProgress; onOpenPath: (path: LearningPath) => void }) {
  const active = pathById('beginner-foundations') ?? paths[0];
  const completed = active.lessonIds.filter(id => nextStatus(progress, id) === 'completed').length;
  const percentage = Math.round((completed / active.lessonIds.length) * 100);
  return <>
    <ScreenHeader eyebrow="Paths" title="One direction at a time." copy="Finish the next useful lesson. The rest will wait." />
    <section className="path-focus">
      <span className="eyebrow">Your path</span>
      <h2>{active.title}</h2>
      <p>{active.description}</p>
      <div className="progress-line"><span style={{ width: `${percentage}%` }} /></div>
      <small>{completed}/{active.lessonIds.length} lessons completed</small>
      <button className="primary-button" type="button" onClick={() => onOpenPath(active)}>Continue path</button>
    </section>
    <section className="quiet-list">
      <span className="list-heading">Explore paths</span>
      {paths.filter(path => path.id !== active.id).map(path => <CompactRow key={path.id} icon="paths" label={path.eyebrow} title={path.title} detail={`${path.estimatedMinutes} min · ${path.access === 'premium' ? 'Premium' : 'Free'}`} action={path.access === 'premium' ? 'Premium' : 'Open'} onClick={() => onOpenPath(path)} />)}
    </section>
  </>;
}

function AfterHoursScreen({ onOpenPremium }: { onOpenPremium: (title: string) => void }) {
  return <>
    <ScreenHeader eyebrow="After Hours" title="Standards, without the noise." copy="Open a tune when you want to apply what you are learning." />
    <section className="standard-shelf">
      {standards.map(standard => <article className="standard-row" key={standard.id}>
        <div><span className="eyebrow">{standard.focus}</span><h2>{standard.title}</h2><p>{standard.subtitle}</p><small>{standard.status === 'available' ? 'Available now' : 'In development'}</small></div>
        {standard.status === 'available' ? <a className="secondary-button" href={standard.href}>Open <Icon name="arrow" size={16} /></a> : <button className="secondary-button" type="button" onClick={() => onOpenPremium(standard.title)}>Premium</button>}
      </article>)}
    </section>
  </>;
}

function ToolsScreen({ metronome, onOpenTuner }: { metronome: ReturnType<typeof useMetronome>; onOpenTuner: () => void }) {
  return <>
    <ScreenHeader eyebrow="Tools" title="Keep time. Tune up." />
    <section className="metronome-panel">
      <span className="eyebrow">Metronome</span>
      <div className="tempo-number">{metronome.tempo}</div>
      <span className="tempo-caption">beats per minute · 4/4</span>
      <div className="beat-row" aria-label="Four beat indicator">{[0, 1, 2, 3].map(index => <span className={metronome.playing && metronome.beat === index ? 'active' : ''} key={index} />)}</div>
      <input aria-label="Tempo" type="range" min="35" max="240" value={metronome.tempo} onChange={event => metronome.setTempo(Number(event.target.value))} />
      <div className="metronome-controls"><button className="secondary-button" type="button" onClick={() => metronome.setTempo(metronome.tempo - 1)}>−</button><button className="primary-button" type="button" onClick={metronome.toggle}>{metronome.playing ? 'Stop' : 'Start'} · {metronome.tempo} BPM</button><button className="secondary-button" type="button" onClick={() => metronome.setTempo(metronome.tempo + 1)}>+</button><button className="secondary-button" type="button" onClick={metronome.tapTempo}>Tap</button></div>
    </section>
    <section className="quiet-list"><span className="list-heading">More tools</span><CompactRow icon="tools" label="Tuner" title="Standard tuning" detail="E A D G B E" action="Open" onClick={onOpenTuner} /></section>
  </>;
}

function ProgressScreen({ progress, activeLesson, onOpenLesson }: { progress: PracticeProgress; activeLesson: Lesson; onOpenLesson: (lesson: Lesson) => void }) {
  const complete = Object.values(progress.lessonStates).filter(status => status === 'completed').length;
  return <>
    <ScreenHeader eyebrow="Progress" title="Your practice, kept simple." />
    <section className="progress-summary"><div><strong>{currentStreak(progress)}</strong><span>day streak</span></div><div><strong>{progress.history.length}</strong><span>sessions</span></div><div><strong>{complete}</strong><span>completed</span></div></section>
    <section className="quiet-list"><span className="list-heading">Keep close</span><CompactRow icon="progress" label="Review" title="Guide Tone Resolution" detail="A short pass through the ii–V–I." action="Open" onClick={() => onOpenLesson(lessonById('guide-tones') ?? activeLesson)} /><CompactRow icon="learn" label="In progress" title={activeLesson.title} detail={`${activeLesson.durationMinutes} min`} action="Open" onClick={() => onOpenLesson(activeLesson)} /></section>
    <section className="history-section"><span className="list-heading">Recent practice</span>{progress.history.length === 0 ? <p>Your completed sessions will show up here.</p> : <div className="history-list">{[...progress.history].reverse().slice(0, 8).map(item => <div key={item.id}><span>{item.lessonTitle}</span><small>{new Date(item.completedAt).toLocaleDateString()}</small></div>)}</div>}</section>
  </>;
}

function CompactRow({ icon, label, title, detail, action, onClick }: { icon: IconName; label: string; title: string; detail: string; action: string; onClick: () => void }) {
  return <button className="compact-row" type="button" onClick={onClick}><span className="row-icon"><Icon name={icon} /></span><span className="row-content"><span className="row-label">{label}</span><strong>{title}</strong><small>{detail}</small></span><span className="row-action">{action} <Icon name="arrow" size={16} /></span></button>;
}

function LessonCard({ lesson, status, onOpen }: { lesson: Lesson; status: ReturnType<typeof nextStatus>; onOpen: () => void }) {
  return <article className="lesson-card"><div><span className="eyebrow">{lesson.category}</span><h3>{lesson.title}</h3><p>{lesson.outcome}</p></div><div className="lesson-card-footer"><div><small>{lesson.durationMinutes} min · {statusLabel(status)}</small><span className={`access-pill ${lesson.access}`}>{accessLabel(lesson.access)}</span></div><button className="secondary-button" type="button" onClick={onOpen}>{status === 'completed' ? 'Review' : 'Open'} <Icon name="arrow" size={15} /></button></div></article>;
}

function PracticeOverlay({ overlay, progress, metronome, onClose, onStart, onComplete, onOpenLesson, onNavigate }: {
  overlay: Exclude<Overlay, null>;
  progress: PracticeProgress;
  metronome: ReturnType<typeof useMetronome>;
  onClose: () => void;
  onStart: (lesson: Lesson) => void;
  onComplete: (lesson: Lesson, daily?: boolean) => void;
  onOpenLesson: (lesson: Lesson) => void;
  onNavigate: (path: string) => void;
}) {
  const sheet = () => {
    if (overlay.kind === 'premium') return <><SheetHeader eyebrow="Morning Changes Premium" title={overlay.title ?? 'Go deeper when you are ready.'} onClose={onClose} /><p>Premium unlocks complete specialization paths, longer guided sessions, and the growing After Hours catalog.</p><ul className="benefit-list"><li>Complete learning paths</li><li>Advanced practice sessions</li><li>More standards and play-alongs</li><li>Review guidance as you progress</li></ul><p className="subtle">Premium access will open when the first full path is ready.</p></>;
    if (overlay.kind === 'tuner') return <><SheetHeader eyebrow="Tuner" title="Standard tuning" onClose={onClose} /><div className="tuner-notes">E&nbsp; A&nbsp; D&nbsp; G&nbsp; B&nbsp; E</div><p>Use the metronome now; the built-in tuner is next in the tools lineup.</p></>;
    if (overlay.kind === 'extra') return <><SheetHeader eyebrow={`Daily ${overlay.extra.kind}`} title={overlay.extra.title} onClose={onClose} /><p>{overlay.extra.detail}</p><div className="extra-card"><strong>{overlay.extra.durationMinutes} minutes</strong><span>{overlay.extra.tempo} BPM</span></div><div className="sheet-actions"><button className="primary-button" type="button" onClick={() => { metronome.setTempo(overlay.extra.tempo); if (!metronome.playing) metronome.toggle(); }}>Start {overlay.extra.tempo} BPM</button></div></>;
    if (overlay.kind === 'path') return <PathSheet path={overlay.path} progress={progress} onClose={onClose} onOpenLesson={onOpenLesson} />;

    const lesson = overlay.kind === 'daily' ? getDailyLesson() : overlay.lesson;
    const isDaily = overlay.kind === 'daily';
    const status = nextStatus(progress, lesson.id);
    return <><SheetHeader eyebrow={isDaily ? `Today · ${lesson.durationMinutes} min` : `${lesson.category} · ${lesson.durationMinutes} min`} title={lesson.title} onClose={onClose} /><p>{lesson.outcome}</p><ol className="routine-list">{lesson.routine.map(step => <li key={step.instruction}><span>{step.minutes} min</span>{step.instruction}</li>)}</ol><div className="sheet-actions"><button className="primary-button" type="button" onClick={() => { onStart(lesson); if (!metronome.playing) metronome.toggle(); }}>{status === 'not-started' ? 'Start session' : 'Continue session'}</button><button className="secondary-button" type="button" onClick={() => onComplete(lesson, isDaily)}>Mark complete</button><button className="secondary-button" type="button" onClick={() => { metronome.setTempo(lesson.metronome.bpm); if (!metronome.playing) metronome.toggle(); }}>{lesson.metronome.bpm} BPM</button></div></>;
  };

  return <div className="sheet-backdrop" role="presentation" onMouseDown={event => { if (event.currentTarget === event.target) onClose(); }}><section className="sheet" role="dialog" aria-modal="true">{sheet()}</section></div>;
}

function PathSheet({ path, progress, onClose, onOpenLesson }: { path: LearningPath; progress: PracticeProgress; onClose: () => void; onOpenLesson: (lesson: Lesson) => void }) {
  const completed = path.lessonIds.filter(id => nextStatus(progress, id) === 'completed').length;
  const percentage = Math.round((completed / path.lessonIds.length) * 100);
  return <><SheetHeader eyebrow={path.eyebrow} title={path.title} onClose={onClose} /><p>{path.description}</p><div className="progress-line"><span style={{ width: `${percentage}%` }} /></div><small className="path-sheet-progress">{completed}/{path.lessonIds.length} completed · {path.estimatedMinutes} min</small><div className="sheet-course-list">{path.lessonIds.map((id, index) => { const lesson = lessonById(id); if (!lesson) return null; return <button key={id} type="button" onClick={() => onOpenLesson(lesson)}><span>{index + 1}</span><div><strong>{lesson.title}</strong><small>{lesson.access === 'premium' ? 'Premium' : statusLabel(nextStatus(progress, id))}</small></div><Icon name="arrow" size={16} /></button>; })}</div></>;
}

function SheetHeader({ eyebrow, title, onClose }: { eyebrow: string; title: string; onClose: () => void }) {
  return <div className="sheet-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="close-button" type="button" onClick={onClose} aria-label="Close"><Icon name="close" /></button></div>;
}

export default function App() {
  return <HashRouter><AppLayout /></HashRouter>;
}
