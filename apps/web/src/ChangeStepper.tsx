import { useMemo, useState } from 'react';
import { transpose, type KeyName } from './lib/theory';
import { buildChord, type Chord, type ChordQuality, type FunctionalChord, type IntervalName, type SpelledNote } from './lib/music';
import { ChordNotation, FunctionNotation, IntervalNotation, NoteNotation } from './MusicNotation';
import type { MusicInterval } from './domain/content';

type Change = { functional: FunctionalChord; degree: MusicInterval; quality: ChordQuality };

type Props = { lessonId: string; selectedKey: KeyName };

const MAJOR_CADENCE: Change[] = [
  { functional: { degree: 'ii', quality: 'minor7', context: 'major' }, degree: '2', quality: 'minor7' },
  { functional: { degree: 'V', quality: 'dominant7', context: 'major' }, degree: '5', quality: 'dominant7' },
  { functional: { degree: 'I', quality: 'major7', context: 'major' }, degree: '1', quality: 'major7' }
];
const MINOR_CADENCE: Change[] = [
  { functional: { degree: 'ii', quality: 'halfDiminished7', context: 'minor' }, degree: '2', quality: 'halfDiminished7' },
  { functional: { degree: 'V', quality: 'dominant7', context: 'minor' }, degree: '5', quality: 'dominant7' },
  { functional: { degree: 'i', quality: 'minor7', context: 'minor' }, degree: '1', quality: 'minor7' }
];
const AUTUMN_LEAVES_A: Change[] = [
  { functional: { degree: 'ii', quality: 'minor7', context: 'major' }, degree: '2', quality: 'minor7' },
  { functional: { degree: 'V', quality: 'dominant7', context: 'major' }, degree: '5', quality: 'dominant7' },
  { functional: { degree: 'I', quality: 'major7', context: 'major' }, degree: '1', quality: 'major7' },
  { functional: { degree: 'IV', quality: 'major7', context: 'major' }, degree: '4', quality: 'major7' },
  { functional: { degree: 'vii', quality: 'halfDiminished7', context: 'minor' }, degree: '7', quality: 'halfDiminished7' },
  { functional: { degree: 'III', quality: 'dominant7', context: 'minor' }, degree: '3', quality: 'dominant7' },
  { functional: { degree: 'vi', quality: 'minor7', context: 'minor' }, degree: '6', quality: 'minor7' },
  { functional: { degree: 'vi', quality: 'minor7', context: 'minor' }, degree: '6', quality: 'minor7' }
];

function guideIntervals(chord: Chord): { third: IntervalName; seventh: IntervalName } {
  const third = chord.tones.find(tone => tone.interval === '3' || tone.interval === 'b3');
  const seventh = chord.tones.find(tone => tone.interval === '7' || tone.interval === 'b7' || tone.interval === 'bb7');
  if (!third || !seventh) throw new Error(`${chord.quality} does not contain guide tones.`);
  return { third: third.interval, seventh: seventh.interval };
}
function sequenceFor(lessonId: string) {
  if (lessonId === 'autumn-leaves-a-section-functions') return { title: 'Autumn Leaves A section', copy: 'Walk the form one bar at a time. The final bar loops back to bar 1.', changes: AUTUMN_LEAVES_A };
  if (lessonId === 'minor-ii-v-i-cadence') return { title: 'Minor ii–V–i', copy: 'Follow either guide-tone route into the minor tonic.', changes: MINOR_CADENCE };
  return { title: 'Guide-tone movement', copy: 'Use the smallest move into the next chord. Either route makes the harmony speak.', changes: MAJOR_CADENCE };
}
function chordFor(key: KeyName, change: Change): Chord { return buildChord(transpose(key, change.degree), change.quality); }
function toneFor(chord: Chord, interval: IntervalName): SpelledNote {
  const tone = chord.tones.find(candidate => candidate.interval === interval);
  if (!tone) throw new Error(`Missing ${interval} in ${chord.quality}.`);
  return tone.note;
}
function Tone({ interval, note, state }: { interval: IntervalName; note: SpelledNote; state: 'ghost' | 'target' }) {
  return <span className={`motion-tone ${state}`}><small><IntervalNotation interval={interval} /></small><strong><NoteNotation note={note} /></strong></span>;
}

export function ChangeStepper({ lessonId, selectedKey }: Props) {
  const pattern = useMemo(() => sequenceFor(lessonId), [lessonId]);
  const [active, setActive] = useState(0);
  const current = pattern.changes[active];
  const next = pattern.changes[(active + 1) % pattern.changes.length];
  const currentChord = chordFor(selectedKey, current);
  const nextChord = chordFor(selectedKey, next);
  const currentGuide = guideIntervals(currentChord);
  const nextGuide = guideIntervals(nextChord);
  const routes = [
    { label: 'Route 1', fromInterval: currentGuide.third, fromNote: toneFor(currentChord, currentGuide.third), toInterval: nextGuide.seventh, toNote: toneFor(nextChord, nextGuide.seventh) },
    { label: 'Route 2', fromInterval: currentGuide.seventh, fromNote: toneFor(currentChord, currentGuide.seventh), toInterval: nextGuide.third, toNote: toneFor(nextChord, nextGuide.third) }
  ];

  return <section className="change-stepper">
    <div className="change-stepper-head"><div><span className="eyebrow">Follow the movement</span><h2>{pattern.title}</h2><p>{pattern.copy}</p></div><span className="change-step-count">Step {active + 1} / {pattern.changes.length}</span></div>
    <aside className="change-how" aria-label="How to use the movement guide"><span className="eyebrow">How to play it</span><p>Choose one route. Hold the muted <b>Now</b> note until the chord changes, then land the glowing <b>Next</b> note right on the change. Do not chase a scale shape—just make that smallest move.</p></aside>
    <div className="change-step-rail" role="tablist" aria-label={`${pattern.title} chord steps`}>
      {pattern.changes.map((change, index) => {
        const chord = chordFor(selectedKey, change);
        return <button key={`${change.functional.degree}-${index}`} type="button" role="tab" aria-selected={active === index} className={active === index ? 'active' : ''} onClick={() => setActive(index)}>
          <small>{pattern.changes.length > 3 ? `Bar ${index + 1}` : `Step ${index + 1}`}</small>
          <strong><ChordNotation chord={chord} /></strong>
          <span><FunctionNotation functional={change.functional} /></span>
        </button>;
      })}
    </div>
    <div className="change-motion-stage">
      <article className="motion-chord current"><span className="eyebrow">Now</span><h3><ChordNotation chord={currentChord} /></h3><span className="motion-function"><FunctionNotation functional={current.functional} /></span><div className="motion-tones">{routes.map(route => <Tone key={route.label} interval={route.fromInterval} note={route.fromNote} state="ghost" />)}</div></article>
      <div className="motion-arrows" aria-hidden="true"><span>→</span><small>move as little as possible</small><span>→</span></div>
      <article className="motion-chord next"><span className="eyebrow">Next</span><h3><ChordNotation chord={nextChord} /></h3><span className="motion-function"><FunctionNotation functional={next.functional} /></span><div className="motion-tones">{routes.map(route => <Tone key={route.label} interval={route.toInterval} note={route.toNote} state="target" />)}</div></article>
    </div>
    <div className="change-routes">{routes.map(route => <div key={route.label}><span>{route.label}</span><strong><Tone interval={route.fromInterval} note={route.fromNote} state="ghost" /> <i>→</i> <Tone interval={route.toInterval} note={route.toNote} state="target" /></strong></div>)}</div>
    <div className="change-step-actions"><button className="secondary-button" type="button" onClick={() => setActive(index => (index - 1 + pattern.changes.length) % pattern.changes.length)} aria-label="Previous chord step">← Previous</button><button className="primary-button" type="button" onClick={() => setActive(index => (index + 1) % pattern.changes.length)} aria-label="Next chord step">Next change →</button></div>
  </section>;
}