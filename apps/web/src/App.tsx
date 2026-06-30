import { useEffect, useMemo, useState } from 'react';
import { HashRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { getDailyExercise, getDailyLesson, getDailyLick, type DailyExtra } from './lib/daily';
import { clampTempo, currentStreak, loadProgress, markCompleted, markStarted, nextStatus, saveProgress, type PracticeProgress } from './lib/progress';
import { useMetronome } from './lib/useMetronome';
import { lessonById, lessons, pathById, paths, standards } from './content/catalog';
import { chordName, chordTones, KEYS, labelMode, modeNotes, randomKey, renderIntervals, type KeyName } from './lib/theory';
import type { Lesson, LearningPath } from './domain/content';

type Overlay =
  | { kind: 'daily' }
  | { kind: 'lesson'; lesson: Lesson }
  | { kind: 'path'; path: LearningPath }
  | { kind: 'extra'; extra: DailyExtra }
  | { kind: 'premium'; title?: string }
  | { kind: 'tuner' }
  | null;

type IconName = 'home' | 'learn' | 'paths' | 'after' | 'tools' | 'progress' | 'play' | 'tempo' | 'close' | 'arrow';

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
  return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function statusLabel(status: ReturnType<typeof nextStatus>) { return status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In progress' : 'New'; }
function accessLabel(access: Lesson['access']) { return access === 'premium' ? 'Premium' : 'Free'; }

function AppLayout() {
  const [progress, setProgress] = useState<PracticeProgress>(() => loadProgress());
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selectedKey, setSelectedKey] = useState<KeyName>(() => randomKey());
  const metronome = useMetronome(progress.tempo, tempo => setProgress(previous => ({ ...previous, tempo: clampTempo(tempo) })));
  useEffect(() => saveProgress(progress), [progress]);

  const dailyLesson = useMemo(() => getDailyLesson(), []);
  const dailyLick = useMemo(() => getDailyLick(), []);
  const dailyExercise = useMemo(() => getDailyExercise(), []);
  const activeLesson = lessons.find(lesson => nextStatus(progress, lesson.id) === 'in-progress') ?? dailyLesson;

  const openLesson = (lesson: Lesson) => {
    if (lesson.defaultKeyStrategy === 'random') setSelectedKey(randomKey(`${lesson.id}-${new Date().toDateString()}`));
    if (lesson.access === 'premium') setOverlay({ kind: 'premium', title: lesson.title });
    else setOverlay({ kind: 'lesson', lesson });
  };
  const openPath = (path: LearningPath) => path.access === 'premium' ? setOverlay({ kind: 'premium', title: path.title }) : setOverlay({ kind: 'path', path });
  const startLesson = (lesson: Lesson) => { setProgress(previous => markStarted(previous, lesson.id)); metronome.setTempo(lesson.metronome.bpm); };
  const completeLesson = (lesson: Lesson, daily = false) => { setProgress(previous => markCompleted(previous, lesson, daily ? 'daily' : 'lesson')); setOverlay(null); };

  return <div className="app-shell">
    <header className="app-topbar">
      <NavLink className="wordmark" to="/" aria-label="Morning Changes home"><span className="wordmark-mark">◒</span><span><strong>Morning Changes</strong><small>Daily guitar practice</small></span></NavLink>
      <nav className="desktop-nav" aria-label="Main navigation">{navItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'active' : ''}>{item.label}</NavLink>)}</nav>
      <button className="tempo-button" type="button" onClick={metronome.toggle}><Icon name="tempo" size={16} /> {metronome.tempo}</button>
    </header>
    <main className="screen"><Routes>
      <Route path="/" element={<HomeScreen dailyLesson={dailyLesson} dailyLick={dailyLick} dailyExercise={dailyExercise} activeLesson={activeLesson} progress={progress} onOpenDaily={() => { setSelectedKey(randomKey(`daily-${new Date().toDateString()}`)); setOverlay({ kind: 'daily' }); }} onOpenLesson={openLesson} onOpenExtra={extra => setOverlay({ kind: 'extra', extra })} />} />
      <Route path="/learn" element={<LearnScreen progress={progress} activeLesson={activeLesson} onOpenLesson={openLesson} />} />
      <Route path="/paths" element={<PathsScreen progress={progress} onOpenPath={openPath} />} />
      <Route path="/after-hours" element={<AfterHoursScreen onOpenPremium={title => setOverlay({ kind: 'premium', title })} />} />
      <Route path="/tools" element={<ToolsScreen metronome={metronome} onOpenTuner={() => setOverlay({ kind: 'tuner' })} />} />
      <Route path="/progress" element={<ProgressScreen progress={progress} activeLesson={activeLesson} onOpenLesson={openLesson} />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes></main>
    <nav className="bottom-nav" aria-label="Mobile navigation">{navItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'active' : ''}><Icon name={item.icon} size={19} /><span>{item.label}</span></NavLink>)}</nav>
    {overlay && <PracticeOverlay overlay={overlay} progress={progress} metronome={metronome} selectedKey={selectedKey} onKeyChange={setSelectedKey} onClose={() => setOverlay(null)} onStart={startLesson} onComplete={completeLesson} onOpenLesson={lesson => { setOverlay(null); openLesson(lesson); }} />}
  </div>;
}

function ScreenHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) { return <section className="screen-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{copy && <p>{copy}</p>}</section>; }

function HomeScreen({ dailyLesson, dailyLick, dailyExercise, activeLesson, progress, onOpenDaily, onOpenLesson, onOpenExtra }: { dailyLesson: Lesson; dailyLick: DailyExtra; dailyExercise: DailyExtra; activeLesson: Lesson; progress: PracticeProgress; onOpenDaily: () => void; onOpenLesson: (lesson: Lesson) => void; onOpenExtra: (extra: DailyExtra) => void }) {
  const activePath = paths.find(path => path.lessonIds.includes(activeLesson.id));
  const done = activePath?.lessonIds.filter(id => nextStatus(progress, id) === 'completed').length ?? 0;
  return <><ScreenHeader eyebrow="Today" title="Ready when you are." /><section className="focus-session"><div><span className="eyebrow">Today’s practice · {dailyLesson.durationMinutes} min</span><h2>{dailyLesson.title}</h2><p>{dailyLesson.outcome}</p><div className="focus-meta"><span>{dailyLesson.durationMinutes} min</span><span>{statusLabel(nextStatus(progress, dailyLesson.id))}</span></div></div><button className="primary-button focus-action" type="button" onClick={onOpenDaily}><Icon name="play" size={16} /> Start session</button></section><section className="quiet-list"><span className="list-heading">Keep going</span><CompactRow icon="paths" label={`${activePath?.title ?? 'Practice path'} · ${done}/${activePath?.lessonIds.length ?? 0}`} title={activeLesson.title} detail="Continue where you left off." action="Open" onClick={() => onOpenLesson(activeLesson)} /><CompactRow icon="after" label={`Daily lick · ${dailyLick.durationMinutes} min`} title={dailyLick.title} detail={dailyLick.detail} action="Open" onClick={() => onOpenExtra(dailyLick)} /><CompactRow icon="tools" label={`Daily exercise · ${dailyExercise.durationMinutes} min`} title={dailyExercise.title} detail={dailyExercise.detail} action="Open" onClick={() => onOpenExtra(dailyExercise)} /><a className="compact-row row-link" href="../after-hours/autumn-leaves/"><span className="row-icon"><Icon name="after" /></span><span className="row-content"><span className="row-label">After Hours</span><strong>Autumn Leaves</strong><small>Apply today’s idea inside the dedicated tune hub.</small></span><span className="row-action">Open <Icon name="arrow" size={16} /></span></a></section></>;
}

function LearnScreen({ progress, activeLesson, onOpenLesson }: { progress: PracticeProgress; activeLesson: Lesson; onOpenLesson: (lesson: Lesson) => void }) {
  const section = (title: string, copy: string, selection: Lesson[]) => <section className="catalog-section" key={title}><div className="catalog-heading"><h2>{title}</h2><p>{copy}</p></div><div className="lesson-rail">{selection.map(lesson => <LessonCard key={lesson.id} lesson={lesson} status={nextStatus(progress, lesson.id)} onOpen={() => onOpenLesson(lesson)} />)}</div></section>;
  return <><ScreenHeader eyebrow="Learn" title="Pick a lane." copy="Every lesson opens in a fresh key. Change the key anytime; the intervals stay the same." /><section className="continue-card"><CompactRow icon="play" label="Continue" title={activeLesson.title} detail={`${statusLabel(nextStatus(progress, activeLesson.id))} · ${activeLesson.durationMinutes} min`} action="Open" onClick={() => onOpenLesson(activeLesson)} /></section>{section('Autumn Leaves Prep', 'Root → scale → chords → guide tones → arpeggios → tune.', lessons.filter(lesson => lesson.pathIds.includes('autumn-leaves-prep')))}{section('Start here', 'Short sessions with no setup.', lessons.filter(lesson => lesson.access === 'free' && lesson.dailyEligible))}{section('Beginner', 'Intervals, roots, scale awareness, and chord building.', lessons.filter(lesson => lesson.level === 'Beginner'))}{section('Intermediate', 'Guide tones, cadences, arpeggios, and tune application.', lessons.filter(lesson => lesson.level === 'Intermediate'))}</>;
}

function PathsScreen({ progress, onOpenPath }: { progress: PracticeProgress; onOpenPath: (path: LearningPath) => void }) {
  const active = pathById('autumn-leaves-prep') ?? paths[0];
  const completed = active.lessonIds.filter(id => nextStatus(progress, id) === 'completed').length;
  return <><ScreenHeader eyebrow="Paths" title="One direction at a time." copy="The first real path builds straight toward improvising over Autumn Leaves." /><section className="path-focus"><span className="eyebrow">Your path</span><h2>{active.title}</h2><p>{active.description}</p><div className="progress-line"><span style={{ width: `${Math.round((completed / active.lessonIds.length) * 100)}%` }} /></div><small>{completed}/{active.lessonIds.length} lessons completed</small><button className="primary-button" type="button" onClick={() => onOpenPath(active)}>Continue path</button></section><section className="quiet-list"><span className="list-heading">Explore paths</span>{paths.filter(path => path.id !== active.id).map(path => <CompactRow key={path.id} icon="paths" label={path.eyebrow} title={path.title} detail={`${path.estimatedMinutes} min · ${path.access === 'premium' ? 'Premium' : 'Free'}`} action={path.access === 'premium' ? 'Premium' : 'Open'} onClick={() => onOpenPath(path)} />)}</section></>;
}

function AfterHoursScreen({ onOpenPremium }: { onOpenPremium: (title: string) => void }) { return <><ScreenHeader eyebrow="After Hours" title="Standards, without the noise." copy="The lesson path brings you here when it is time to apply the concept to the tune." /><section className="standard-shelf">{standards.map(standard => <article className="standard-row" key={standard.id}><div><span className="eyebrow">{standard.focus}</span><h2>{standard.title}</h2><p>{standard.subtitle}</p><small>{standard.status === 'available' ? 'Available now' : 'In development'}</small></div>{standard.status === 'available' ? <a className="secondary-button" href={standard.href}>Open <Icon name="arrow" size={16} /></a> : <button className="secondary-button" type="button" onClick={() => onOpenPremium(standard.title)}>Premium</button>}</article>)}</section></>; }

function ToolsScreen({ metronome, onOpenTuner }: { metronome: ReturnType<typeof useMetronome>; onOpenTuner: () => void }) { return <><ScreenHeader eyebrow="Tools" title="Keep time. Tune up." /><section className="metronome-panel"><span className="eyebrow">Metronome</span><div className="tempo-number">{metronome.tempo}</div><span className="tempo-caption">beats per minute · 4/4</span><div className="beat-row">{[0, 1, 2, 3].map(index => <span className={metronome.playing && metronome.beat === index ? 'active' : ''} key={index} />)}</div><input aria-label="Tempo" type="range" min="35" max="240" value={metronome.tempo} onChange={event => metronome.setTempo(Number(event.target.value))} /><div className="metronome-controls"><button className="secondary-button" type="button" onClick={() => metronome.setTempo(metronome.tempo - 1)}>−</button><button className="primary-button" type="button" onClick={metronome.toggle}>{metronome.playing ? 'Stop' : 'Start'} · {metronome.tempo} BPM</button><button className="secondary-button" type="button" onClick={() => metronome.setTempo(metronome.tempo + 1)}>+</button><button className="secondary-button" type="button" onClick={metronome.tapTempo}>Tap</button></div></section><section className="quiet-list"><span className="list-heading">More tools</span><CompactRow icon="tools" label="Tuner" title="Standard tuning" detail="E A D G B E" action="Open" onClick={onOpenTuner} /></section></>; }

function ProgressScreen({ progress, activeLesson, onOpenLesson }: { progress: PracticeProgress; activeLesson: Lesson; onOpenLesson: (lesson: Lesson) => void }) { const complete = Object.values(progress.lessonStates).filter(status => status === 'completed').length; return <><ScreenHeader eyebrow="Progress" title="Your practice, kept simple." /><section className="progress-summary"><div><strong>{currentStreak(progress)}</strong><span>day streak</span></div><div><strong>{progress.history.length}</strong><span>sessions</span></div><div><strong>{complete}</strong><span>completed</span></div></section><section className="quiet-list"><span className="list-heading">Keep close</span><CompactRow icon="progress" label="Review" title="Autumn Leaves Prep" detail="Return to the current path." action="Open" onClick={() => onOpenLesson(activeLesson)} /></section></>; }

function CompactRow({ icon, label, title, detail, action, onClick }: { icon: IconName; label: string; title: string; detail: string; action: string; onClick: () => void }) { return <button className="compact-row" type="button" onClick={onClick}><span className="row-icon"><Icon name={icon} /></span><span className="row-content"><span className="row-label">{label}</span><strong>{title}</strong><small>{detail}</small></span><span className="row-action">{action} <Icon name="arrow" size={16} /></span></button>; }
function LessonCard({ lesson, status, onOpen }: { lesson: Lesson; status: ReturnType<typeof nextStatus>; onOpen: () => void }) { return <article className="lesson-card"><div><span className="eyebrow">{lesson.category}</span><h3>{lesson.title}</h3><p>{lesson.outcome}</p></div><div className="lesson-card-footer"><div><small>{lesson.durationMinutes} min · {statusLabel(status)}</small><span className={`access-pill ${lesson.access}`}>{accessLabel(lesson.access)}</span></div><button className="secondary-button" type="button" onClick={onOpen}>{status === 'completed' ? 'Review' : 'Open'} <Icon name="arrow" size={15} /></button></div></article>; }

function KeySelector({ selectedKey, onKeyChange }: { selectedKey: KeyName; onKeyChange: (key: KeyName) => void }) { return <label className="key-selector"><span>Key</span><select value={selectedKey} onChange={event => onKeyChange(event.target.value as KeyName)}>{KEYS.map(key => <option key={key} value={key}>{key}</option>)}</select></label>; }
function IntervalPanel({ lesson, selectedKey, onKeyChange }: { lesson: Lesson; selectedKey: KeyName; onKeyChange: (key: KeyName) => void }) { if (!lesson.concept) return null; const mode = lesson.keyMode; return <section className="interval-panel"><div className="interval-panel-head"><div><span className="eyebrow">Interval engine · {labelMode(mode)}</span><h3>{selectedKey} {labelMode(mode)}</h3></div><KeySelector selectedKey={selectedKey} onKeyChange={onKeyChange} /></div><p>{lesson.concept.summary}</p><div className="interval-grid">{renderIntervals(selectedKey, lesson.concept.intervals).map(item => <span key={`${item.interval}-${item.note}`}><strong>{item.interval}</strong><small>{item.note}</small></span>)}</div><div className="mode-notes">{modeNotes(selectedKey, mode).map(item => <span key={`${item.interval}-${item.note}`}>{item.interval}: {item.note}</span>)}</div>{lesson.concept.examples.length > 0 && <div className="chord-render-list">{lesson.concept.examples.map(example => <article key={`${example.function}-${example.label}`}><div><span className="eyebrow">{example.function}</span><strong>{chordName(selectedKey, example)}</strong><small>{example.label}</small></div><p>{chordTones(selectedKey, example).map(tone => `${tone.interval}:${tone.note}`).join(' · ')}</p></article>)}</div>}{lesson.concept.afterHoursHref && <a className="after-hours-bridge" href={lesson.concept.afterHoursHref}>{lesson.concept.afterHoursCta ?? 'Apply in After Hours'} <Icon name="arrow" size={16} /></a>}</section>; }

function PracticeOverlay({ overlay, progress, metronome, selectedKey, onKeyChange, onClose, onStart, onComplete, onOpenLesson }: { overlay: Exclude<Overlay, null>; progress: PracticeProgress; metronome: ReturnType<typeof useMetronome>; selectedKey: KeyName; onKeyChange: (key: KeyName) => void; onClose: () => void; onStart: (lesson: Lesson) => void; onComplete: (lesson: Lesson, daily?: boolean) => void; onOpenLesson: (lesson: Lesson) => void }) {
  const sheet = () => {
    if (overlay.kind === 'premium') return <><SheetHeader eyebrow="Morning Changes Premium" title={overlay.title ?? 'Go deeper when you are ready.'} onClose={onClose} /><p>Premium unlocks complete specialization paths, longer guided sessions, and the growing After Hours catalog.</p></>;
    if (overlay.kind === 'tuner') return <><SheetHeader eyebrow="Tuner" title="Standard tuning" onClose={onClose} /><div className="tuner-notes">E&nbsp; A&nbsp; D&nbsp; G&nbsp; B&nbsp; E</div><p>Quick tuning is coming to Morning Changes.</p></>;
    if (overlay.kind === 'extra') return <><SheetHeader eyebrow={`Daily ${overlay.extra.kind}`} title={overlay.extra.title} onClose={onClose} /><p>{overlay.extra.detail}</p><div className="extra-card"><strong>{overlay.extra.durationMinutes} minutes</strong><span>{overlay.extra.tempo} BPM</span></div><div className="sheet-actions"><button className="primary-button" type="button" onClick={() => { metronome.setTempo(overlay.extra.tempo); if (!metronome.playing) metronome.toggle(); }}>Start {overlay.extra.tempo} BPM</button></div></>;
    if (overlay.kind === 'path') return <PathSheet path={overlay.path} progress={progress} onClose={onClose} onOpenLesson={onOpenLesson} />;
    const lesson = overlay.kind === 'daily' ? getDailyLesson() : overlay.lesson;
    const isDaily = overlay.kind === 'daily';
    const status = nextStatus(progress, lesson.id);
    return <><SheetHeader eyebrow={isDaily ? `Today · ${lesson.durationMinutes} min` : `${lesson.category} · ${lesson.durationMinutes} min`} title={lesson.title} onClose={onClose} /><p>{lesson.outcome}</p><IntervalPanel lesson={lesson} selectedKey={selectedKey} onKeyChange={onKeyChange} /><ol className="routine-list">{lesson.routine.map(step => <li key={step.instruction}><span>{step.minutes} min</span>{step.instruction}</li>)}</ol><div className="sheet-actions"><button className="primary-button" type="button" onClick={() => { onStart(lesson); if (!metronome.playing) metronome.toggle(); }}>{status === 'not-started' ? 'Start session' : 'Continue session'}</button><button className="secondary-button" type="button" onClick={() => onComplete(lesson, isDaily)}>Mark complete</button><button className="secondary-button" type="button" onClick={() => { metronome.setTempo(lesson.metronome.bpm); if (!metronome.playing) metronome.toggle(); }}>{lesson.metronome.bpm} BPM</button></div></>;
  };
  return <div className="sheet-backdrop" onMouseDown={event => { if (event.currentTarget === event.target) onClose(); }}><section className="sheet" role="dialog" aria-modal="true">{sheet()}</section></div>;
}
function PathSheet({ path, progress, onClose, onOpenLesson }: { path: LearningPath; progress: PracticeProgress; onClose: () => void; onOpenLesson: (lesson: Lesson) => void }) { const completed = path.lessonIds.filter(id => nextStatus(progress, id) === 'completed').length; return <><SheetHeader eyebrow={path.eyebrow} title={path.title} onClose={onClose} /><p>{path.description}</p><div className="progress-line"><span style={{ width: `${Math.round((completed / path.lessonIds.length) * 100)}%` }} /></div><small className="path-sheet-progress">{completed}/{path.lessonIds.length} completed · {path.estimatedMinutes} min</small><div className="sheet-course-list">{path.lessonIds.map((id, index) => { const lesson = lessonById(id); return lesson ? <button key={id} type="button" onClick={() => onOpenLesson(lesson)}><span>{index + 1}</span><div><strong>{lesson.title}</strong><small>{lesson.access === 'premium' ? 'Premium' : statusLabel(nextStatus(progress, id))}</small></div><Icon name="arrow" size={16} /></button> : null; })}</div></>; }
function SheetHeader({ eyebrow, title, onClose }: { eyebrow: string; title: string; onClose: () => void }) { return <div className="sheet-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="close-button" type="button" onClick={onClose} aria-label="Close"><Icon name="close" /></button></div>; }
export default function App() { return <HashRouter><AppLayout /></HashRouter>; }
