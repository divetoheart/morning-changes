import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { findDailyExtra } from './lib/daily';
import { lessonById } from './content/catalog';
import { KEYS, modeNotes, randomKey, renderIntervals, type KeyName } from './lib/theory';
import { useMetronome } from './lib/useMetronome';
import { MusicText } from './MusicText';

const NOTE_INDEX: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
const NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const TUNING = [{ label: 'e', note: 'E' }, { label: 'B', note: 'B' }, { label: 'G', note: 'G' }, { label: 'D', note: 'D' }, { label: 'A', note: 'A' }, { label: 'E', note: 'E' }];

type Props = {
  metronome: ReturnType<typeof useMetronome>;
  onOpenLesson: (id: string) => void;
};

export function PracticeExtraPage({ metronome, onOpenLesson }: Props) {
  const { kind, extraId } = useParams();
  const navigate = useNavigate();
  const extra = findDailyExtra(kind, extraId);
  const [key, setKey] = useState<KeyName>(() => randomKey());

  useEffect(() => {
    if (extra) setKey(randomKey(`${extra.id}-${new Date().toDateString()}`));
  }, [extra?.id]);

  if (!extra) {
    return <section className="lesson-page"><nav className="lesson-breadcrumb"><button type="button" onClick={() => navigate('/')}>← Home</button></nav><h1>Practice item not found.</h1></section>;
  }

  const relatedLesson = extra.relatedLessonId ? lessonById(extra.relatedLessonId) : undefined;
  const notes = renderIntervals(key, extra.intervals);

  return <article className="lesson-page extra-page">
    <nav className="lesson-breadcrumb"><button type="button" onClick={() => navigate('/')}>← Today</button><span>Daily {extra.kind}</span></nav>
    <section className="lesson-hero">
      <div>
        <span className="eyebrow">Daily {extra.kind} · {extra.durationMinutes} min</span>
        <h1>{extra.title}</h1>
        <p><MusicText>{extra.detail}</MusicText></p>
      </div>
      <div className="lesson-actions">
        <label className="key-selector"><span>Key</span><select value={key} onChange={event => setKey(event.target.value as KeyName)}>{KEYS.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
        <button className="primary-button" type="button" onClick={() => { metronome.setTempo(extra.tempo); if (!metronome.playing) metronome.toggle(); }}>Start · {extra.tempo} BPM</button>
      </div>
    </section>

    <section className="interval-panel extra-pattern-panel">
      <span className="eyebrow">Pattern</span>
      <div className="symbol-pattern"><MusicText>{extra.pattern}</MusicText></div>
      <div className="interval-grid">{notes.map(item => <span key={`${item.interval}-${item.note}`}><strong>{item.interval}</strong><small>{item.note}</small></span>)}</div>
      <div className="mode-notes">{modeNotes(key, extra.keyMode).map(item => <span key={`${item.interval}-${item.note}`}>{item.interval}: {item.note}</span>)}</div>
    </section>

    <PracticeNeck keyName={key} targetNotes={notes.map(item => ({ interval: item.interval, note: item.note }))} />

    <section className="practice-plan">
      <div><span className="eyebrow">Practice plan</span><h2>Make one thing feel easy.</h2></div>
      <ol className="routine-list">{extra.steps.map(step => <li key={step.instruction}><span>{step.minutes} min</span><MusicText>{step.instruction}</MusicText></li>)}</ol>
      <div className="sheet-actions">
        {relatedLesson && <button className="secondary-button" type="button" onClick={() => onOpenLesson(relatedLesson.id)}>Open lesson: {relatedLesson.title}</button>}
        {extra.afterHoursHref && <a className="after-hours-bridge" href={extra.afterHoursHref}>{extra.afterHoursCta ?? 'Apply it in After Hours'} →</a>}
      </div>
    </section>
  </article>;
}

function PracticeNeck({ keyName, targetNotes }: { keyName: KeyName; targetNotes: Array<{ interval: string; note: string }> }) {
  const dotFor = (open: string, fret: number) => {
    const note = NOTES[(NOTE_INDEX[open] + fret) % 12];
    return targetNotes.find(target => target.note === note);
  };
  return <section className="fretboard-card"><div><span className="eyebrow">Fretboard visual</span><h2>{keyName} on the neck</h2><p>Intervals lead. The note names change when you choose a new key.</p></div><div className="fretboard-scroll"><div className="fretboard"><div className="fret-row fret-numbers"><span></span>{Array.from({ length: 13 }, (_, fret) => <span key={fret}>{fret}</span>)}</div>{TUNING.map(string => <div className="fret-row" key={string.label + string.note}><b>{string.label}</b>{Array.from({ length: 13 }, (_, fret) => { const dot = dotFor(string.note, fret); return <span className={dot ? 'has-dot' : ''} key={fret}>{dot && <i><strong>{dot.interval}</strong><small>{dot.note}</small></i>}</span>; })}</div>)}</div></div></section>;
}
