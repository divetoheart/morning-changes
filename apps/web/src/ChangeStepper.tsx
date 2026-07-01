import { useMemo, useState } from 'react';
import { transpose, type KeyName } from './lib/theory';
import type { MusicInterval } from './domain/content';

type Quality = 'm7' | '7' | 'maj7' | 'm7b5';
type Change = { function: string; degree: MusicInterval; quality: Quality };

type Props = {
  lessonId: string;
  selectedKey: KeyName;
};

const MAJOR_CADENCE: Change[] = [
  { function: 'ii', degree: '2', quality: 'm7' },
  { function: 'V', degree: '5', quality: '7' },
  { function: 'I', degree: '1', quality: 'maj7' }
];

const MINOR_CADENCE: Change[] = [
  { function: 'iiø', degree: '2', quality: 'm7b5' },
  { function: 'V', degree: '5', quality: '7' },
  { function: 'i', degree: '1', quality: 'm7' }
];

const AUTUMN_LEAVES_A: Change[] = [
  { function: 'ii', degree: '2', quality: 'm7' },
  { function: 'V', degree: '5', quality: '7' },
  { function: 'I', degree: '1', quality: 'maj7' },
  { function: 'IV', degree: '4', quality: 'maj7' },
  { function: 'viiø', degree: '7', quality: 'm7b5' },
  { function: 'III', degree: '3', quality: '7' },
  { function: 'vi', degree: '6', quality: 'm7' },
  { function: 'vi', degree: '6', quality: 'm7' }
];

function formatNote(note: string) {
  return note.replaceAll('bb', '♭♭').replaceAll('b', '♭').replaceAll('##', '♯♯').replaceAll('#', '♯');
}

function qualityLabel(quality: Quality) {
  return quality === 'm7b5' ? 'm7♭5' : quality;
}

function guideIntervals(quality: Quality): { third: MusicInterval; seventh: MusicInterval } {
  if (quality === 'maj7') return { third: '3', seventh: '7' };
  if (quality === '7') return { third: '3', seventh: 'b7' };
  return { third: 'b3', seventh: 'b7' };
}

function sequenceFor(lessonId: string) {
  if (lessonId === 'autumn-leaves-a-section-functions') return { title: 'Autumn Leaves A section', copy: 'Walk the form one bar at a time. The last chord loops back to bar 1.', changes: AUTUMN_LEAVES_A };
  if (lessonId === 'minor-ii-v-i-cadence') return { title: 'Minor ii–V–i', copy: 'Follow the two guide-tone routes into the minor tonic.', changes: MINOR_CADENCE };
  return { title: 'Guide-tone movement', copy: 'Use the smallest move into the next chord. Either route will make the harmony speak.', changes: MAJOR_CADENCE };
}

function chordRoot(key: KeyName, change: Change) {
  return transpose(key, change.degree) as KeyName;
}

function ChordText({ root, quality }: { root: string; quality: Quality }) {
  const letter = root.slice(0, 1);
  const accidental = root.slice(1);
  return <span className="chord-symbol"><span className="chord-root">{letter}</span>{accidental && <sup className="music-accidental">{formatNote(accidental)}</sup>}<sup className="chord-quality">{qualityLabel(quality)}</sup></span>;
}

function FunctionText({ value }: { value: string }) {
  const numeral = value.replace('ø', '');
  return <span className="function-symbol"><em>{numeral}</em>{value.includes('ø') && <sup>ø</sup>}</span>;
}

function Tone({ interval, note, state }: { interval: MusicInterval; note: string; state: 'ghost' | 'target' }) {
  return <span className={`motion-tone ${state}`}><small>{interval}</small><strong>{formatNote(note)}</strong></span>;
}

export function ChangeStepper({ lessonId, selectedKey }: Props) {
  const pattern = useMemo(() => sequenceFor(lessonId), [lessonId]);
  const [active, setActive] = useState(0);
  const current = pattern.changes[active];
  const next = pattern.changes[(active + 1) % pattern.changes.length];
  const currentRoot = chordRoot(selectedKey, current);
  const nextRoot = chordRoot(selectedKey, next);
  const currentGuide = guideIntervals(current.quality);
  const nextGuide = guideIntervals(next.quality);
  const routes = [
    {
      label: 'Route 1',
      fromInterval: currentGuide.third,
      fromNote: transpose(currentRoot, currentGuide.third),
      toInterval: nextGuide.seventh,
      toNote: transpose(nextRoot, nextGuide.seventh)
    },
    {
      label: 'Route 2',
      fromInterval: currentGuide.seventh,
      fromNote: transpose(currentRoot, currentGuide.seventh),
      toInterval: nextGuide.third,
      toNote: transpose(nextRoot, nextGuide.third)
    }
  ];

  return <section className="change-stepper" data-music-context="true">
    <div className="change-stepper-head">
      <div><span className="eyebrow">Follow the movement</span><h2>{pattern.title}</h2><p>{pattern.copy}</p></div>
      <span className="change-step-count">Step {active + 1} / {pattern.changes.length}</span>
    </div>

    <div className="change-step-rail" role="tablist" aria-label={`${pattern.title} chord steps`}>
      {pattern.changes.map((change, index) => {
        const root = chordRoot(selectedKey, change);
        return <button key={`${change.function}-${index}`} type="button" role="tab" aria-selected={active === index} className={active === index ? 'active' : ''} onClick={() => setActive(index)}>
          <small>{pattern.changes.length > 3 ? `Bar ${index + 1}` : `Step ${index + 1}`}</small>
          <strong><ChordText root={root} quality={change.quality} /></strong>
          <span><FunctionText value={change.function} /></span>
        </button>;
      })}
    </div>

    <div className="change-motion-stage">
      <article className="motion-chord current">
        <span className="eyebrow">Now</span>
        <h3><ChordText root={currentRoot} quality={current.quality} /></h3>
        <span className="motion-function"><FunctionText value={current.function} /></span>
        <div className="motion-tones">{routes.map(route => <Tone key={route.label} interval={route.fromInterval} note={route.fromNote} state="ghost" />)}</div>
      </article>
      <div className="motion-arrows" aria-hidden="true"><span>→</span><small>smallest move</small><span>→</span></div>
      <article className="motion-chord next">
        <span className="eyebrow">Next</span>
        <h3><ChordText root={nextRoot} quality={next.quality} /></h3>
        <span className="motion-function"><FunctionText value={next.function} /></span>
        <div className="motion-tones">{routes.map(route => <Tone key={route.label} interval={route.toInterval} note={route.toNote} state="target" />)}</div>
      </article>
    </div>

    <div className="change-routes">
      {routes.map(route => <div key={route.label}><span>{route.label}</span><strong><Tone interval={route.fromInterval} note={route.fromNote} state="ghost" /> <i>→</i> <Tone interval={route.toInterval} note={route.toNote} state="target" /></strong></div>)}
    </div>

    <div className="change-step-actions">
      <button className="secondary-button" type="button" onClick={() => setActive(index => (index - 1 + pattern.changes.length) % pattern.changes.length)} aria-label="Previous chord step">← Previous</button>
      <button className="primary-button" type="button" onClick={() => setActive(index => (index + 1) % pattern.changes.length)} aria-label="Next chord step">Next change →</button>
    </div>
  </section>;
}
