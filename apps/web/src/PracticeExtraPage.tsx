import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { findDailyExtra } from './lib/daily';
import { lessonById } from './content/catalog';
import { KEYS, randomKey, type KeyName } from './lib/theory';
import { useMetronome } from './lib/useMetronome';
import { MusicText } from './MusicText';
import { FullNeckDiagram } from './FullNeckDiagram';
import { IntervalNotation, KeyNotation, NoteNotation } from './MusicNotation';
import { buildScale, createKey, parseNote, positionsForIntervals, transposeNote, type IntervalName, type ScaleMode } from './lib/music';

const ENGINE_MODE: Record<'major' | 'natural-minor' | 'harmonic-minor', ScaleMode> = {
  major: 'major',
  'natural-minor': 'naturalMinor',
  'harmonic-minor': 'harmonicMinor'
};

type Props = { metronome: ReturnType<typeof useMetronome>; onOpenLesson: (id: string) => void };

export function PracticeExtraPage({ metronome, onOpenLesson }: Props) {
  const { kind, extraId } = useParams();
  const navigate = useNavigate();
  const extra = findDailyExtra(kind, extraId);
  const [key, setKey] = useState<KeyName>(() => randomKey());

  useEffect(() => { if (extra) setKey(randomKey(`${extra.id}-${new Date().toDateString()}`)); }, [extra?.id]);
  if (!extra) return <section className="lesson-page"><nav className="lesson-breadcrumb"><button type="button" onClick={() => navigate('/')}>← Home</button></nav><h1>Practice item not found.</h1></section>;

  const relatedLesson = extra.relatedLessonId ? lessonById(extra.relatedLessonId) : undefined;
  const intervalNames = extra.intervals as IntervalName[];
  const keyContext = useMemo(() => createKey(key, ENGINE_MODE[extra.keyMode]), [key, extra.keyMode]);
  const notes = useMemo(() => intervalNames.map(interval => ({ interval, note: transposeNote(keyContext.tonic, interval) })), [intervalNames, keyContext]);
  const scale = useMemo(() => buildScale(keyContext), [keyContext]);
  const neckTones = useMemo(() => positionsForIntervals(keyContext.tonic, intervalNames, 'scaleTone'), [keyContext, intervalNames]);

  return <article className="lesson-page extra-page">
    <nav className="lesson-breadcrumb"><button type="button" onClick={() => navigate('/')}>← Today</button><span>Daily {extra.kind}</span></nav>
    <section className="lesson-hero"><div><span className="eyebrow">Daily {extra.kind} · {extra.durationMinutes} min</span><h1>{extra.title}</h1><p><MusicText>{extra.detail}</MusicText></p></div><div className="lesson-actions"><label className="key-selector"><span>Key</span><select value={key} onChange={event => setKey(event.target.value as KeyName)}>{KEYS.map(option => <option key={option} value={option}>{option}</option>)}</select></label><button className="primary-button" type="button" onClick={() => { metronome.setTempo(extra.tempo); if (!metronome.playing) metronome.toggle(); }}>Start · {extra.tempo} BPM</button></div></section>
    <section className="interval-panel extra-pattern-panel"><span className="eyebrow">Pattern</span><div className="symbol-pattern"><MusicText>{extra.pattern}</MusicText></div><div className="interval-grid">{notes.map(item => <span key={`${item.interval}-${item.note.pitchClass}`}><strong><IntervalNotation interval={item.interval} /></strong><small><NoteNotation note={item.note} /></small></span>)}</div><div className="mode-notes">{scale.map(item => <span key={`${item.interval}-${item.note.pitchClass}`}><IntervalNotation interval={item.interval} />: <NoteNotation note={item.note} /></span>)}</div></section>
    <FullNeckDiagram title={<><KeyNotation context={keyContext} /> on the neck</>} description="Intervals lead. Note names change with the selected key." tones={neckTones} />
    <section className="practice-plan"><div><span className="eyebrow">Practice plan</span><h2>Make one thing feel easy.</h2></div><ol className="routine-list">{extra.steps.map(step => <li key={step.instruction}><span>{step.minutes} min</span><MusicText>{step.instruction}</MusicText></li>)}</ol><div className="sheet-actions">{relatedLesson && <button className="secondary-button" type="button" onClick={() => onOpenLesson(relatedLesson.id)}>Open lesson: {relatedLesson.title}</button>}{extra.afterHoursHref && <a className="after-hours-bridge" href={extra.afterHoursHref}>{extra.afterHoursCta ?? 'Apply it in After Hours'} →</a>}</div></section>
  </article>;
}