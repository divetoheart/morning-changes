import { type ReactNode, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { KEYS, transpose, type KeyName } from './lib/theory';

type Quality = 'm7' | '7' | 'maj7' | 'm7b5';
type Degree = '1' | '2' | '3' | '4' | '5' | '6' | '7';
type Bar = { function: string; degree: Degree; quality: Quality; label: string };
type TexasBar = { function: 'I' | 'IV' | 'V'; root: KeyName; label: string };
type Tone = { interval: string; note: string };

const MINOR_LABELS: Record<KeyName, string> = { C: 'C minor', Db: 'D♭ minor', D: 'D minor', Eb: 'E♭ minor', E: 'E minor', F: 'F minor', Gb: 'G♭ minor', G: 'G minor', Ab: 'A♭ minor', A: 'A minor', Bb: 'B♭ minor', B: 'B minor' };
const NOTE_VALUES: Record<KeyName, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
const CHROMATIC: KeyName[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const TUNING: Array<{ label: string; note: KeyName }> = [{ label: 'e', note: 'E' }, { label: 'B', note: 'B' }, { label: 'G', note: 'G' }, { label: 'D', note: 'D' }, { label: 'A', note: 'A' }, { label: 'E', note: 'E' }];
const WINDOW = [3, 4, 5, 6, 7, 8];

const A_SECTION: Bar[] = [
  { function: 'ii', degree: '2', quality: 'm7', label: 'major ii' }, { function: 'V', degree: '5', quality: '7', label: 'major V' }, { function: 'I', degree: '1', quality: 'maj7', label: 'relative major' }, { function: 'IV', degree: '4', quality: 'maj7', label: 'major IV' },
  { function: 'iiø', degree: '2', quality: 'm7b5', label: 'minor iiø' }, { function: 'V', degree: '5', quality: '7', label: 'minor V' }, { function: 'i', degree: '1', quality: 'm7', label: 'minor tonic' }, { function: 'i', degree: '1', quality: 'm7', label: 'hold / loop' }
];
const TEXAS_FORM: TexasBar[] = [
  { function: 'I', root: 'G', label: 'home' }, { function: 'I', root: 'G', label: 'hold' }, { function: 'I', root: 'G', label: 'home' }, { function: 'I', root: 'G', label: 'turn' },
  { function: 'IV', root: 'C', label: 'lift' }, { function: 'IV', root: 'C', label: 'hold' }, { function: 'I', root: 'G', label: 'home' }, { function: 'I', root: 'G', label: 'space' },
  { function: 'V', root: 'D', label: 'peak' }, { function: 'IV', root: 'C', label: 'answer' }, { function: 'I', root: 'G', label: 'resolve' }, { function: 'V', root: 'D', label: 'turnaround' }
];
const FORMULAS: Record<Quality, Array<[string, '1' | 'b3' | '3' | 'b5' | '5' | 'b7' | '7']>> = {
  m7: [['1', '1'], ['♭3', 'b3'], ['5', '5'], ['♭7', 'b7']],
  '7': [['1', '1'], ['3', '3'], ['5', '5'], ['♭7', 'b7']],
  maj7: [['1', '1'], ['3', '3'], ['5', '5'], ['7', '7']],
  m7b5: [['1', '1'], ['♭3', 'b3'], ['♭5', 'b5'], ['♭7', 'b7']]
};

function pretty(note: string) { return note.replaceAll('bb', '♭♭').replaceAll('b', '♭').replaceAll('##', '♯♯').replaceAll('#', '♯'); }
function qualityName(quality: Quality) { return quality === 'm7b5' ? 'm7♭5' : quality; }
function relativeMajor(minor: KeyName) { return transpose(minor, 'b3') as KeyName; }
function autumnRoot(minor: KeyName, bar: Bar, index: number) { return transpose(index < 4 ? relativeMajor(minor) : minor, bar.degree) as KeyName; }
function chordTones(root: KeyName, quality: Quality): Tone[] { return FORMULAS[quality].map(([interval, degree]) => ({ interval, note: transpose(root, degree) })); }
function noteAt(open: KeyName, fret: number) { return CHROMATIC[(NOTE_VALUES[open] + fret) % 12]; }

function Chord({ root, quality }: { root: string; quality: Quality }) {
  const letter = root.slice(0, 1); const accidental = root.slice(1);
  return <span className="chord-symbol after-native-chord"><span className="chord-root">{letter}</span>{accidental && <sup className="music-accidental">{pretty(accidental)}</sup>}<sup className="chord-quality">{qualityName(quality)}</sup></span>;
}
function FunctionMark({ value }: { value: string }) { return <span className="function-symbol"><em>{value.replace('ø', '')}</em>{value.includes('ø') && <sup>ø</sup>}</span>; }

function ContextGrid({ tune }: { tune: 'autumn' | 'texas' }) {
  const content = tune === 'autumn'
    ? [['Hear the two worlds', 'Bars 1–4 live in the relative major. Bars 5–8 turn home to the minor tonic.'], ['Keep the line alive', 'Use a chord tone as the last note of one bar and the first note of the next.'], ['Earn the arpeggio', 'Play the form with roots and guide tones before you expand into full arpeggios.']]
    : [['The sound is in the space', 'The slow feel makes silence part of the phrase. Leave a beat after a strong note.'], ['Hear dominant color', 'The 3rd and ♭7 identify each dominant chord more clearly than a memorized blues box.'], ['Build the answer', 'Let the V bar point into IV, then resolve home with a small melodic answer.']];
  return <section className="after-native-context-grid">{content.map(([title, copy]) => <article key={title}><span className="eyebrow">{tune === 'autumn' ? 'Tune logic' : 'Slow blues logic'}</span><h3>{title}</h3><p>{copy}</p></article>)}</section>;
}

function ToneGrid({ items, guideOnly = false }: { items: Tone[]; guideOnly?: boolean }) {
  return <div className="after-native-tones">{items.map(item => {
    const target = ['3', '♭3', '7', '♭7'].includes(item.interval);
    return <span key={`${item.interval}-${item.note}`} className={guideOnly && target ? 'target' : item.interval === '1' ? 'root' : ''}><small>{item.interval}</small><b>{pretty(item.note)}</b></span>;
  })}</div>;
}

function NativeFretboard({ title, copy, items }: { title: ReactNode; copy: string; items: Tone[] }) {
  const toneAt = (open: KeyName, fret: number) => items.find(item => item.note === noteAt(open, fret));
  return <section className="after-native-neck-section">
    <div className="after-native-neck-head"><div><span className="eyebrow">Fretboard window · 3rd–8th fret</span><h2>{title}</h2><p>{copy}</p></div><span>Squares = root · circles = other chord tones</span></div>
    <div className="after-native-neck-scroll" tabIndex={0} role="region" aria-label="Horizontally scrollable chord-tone fretboard"><div className="after-native-neck">
      <div className="after-native-neck-frets"><span></span>{WINDOW.map(fret => <span key={fret}>{fret}</span>)}</div>
      {TUNING.map(string => <div className="after-native-neck-string" key={`${string.label}-${string.note}`}><b>{string.label}</b>{WINDOW.map(fret => { const tone = toneAt(string.note, fret); return <span key={fret}>{tone && <i className={tone.interval === '1' ? 'root' : ''}><strong>{tone.interval}</strong><small>{pretty(tone.note)}</small></i>}</span>; })}</div>)}
    </div></div>
  </section>;
}

function Header({ title, copy, back = false }: { title: string; copy: ReactNode; back?: boolean }) {
  return <section className="after-native-hero"><div><span className="eyebrow">After Hours · Standards Library</span><h1>{title}</h1><p>{copy}</p></div>{back ? <a className="secondary-button" href="#/after-hours">← Standards Library</a> : null}</section>;
}

function JumpNav({ children, label }: { children: ReactNode; label: string }) { return <nav className="after-native-jump" aria-label={label}>{children}</nav>; }
function NativeBarMap({ bars, active, onChange, kind }: { bars: Array<{ function: string; root: KeyName; label: string; quality: Quality }>; active: number; onChange: (index: number) => void; kind: 'autumn' | 'texas' }) {
  return <div className={`after-native-bars ${kind === 'texas' ? 'texas-bars' : ''}`}>{bars.map((bar, index) => <button key={`${bar.function}-${index}`} className={index === active ? 'active' : ''} type="button" onClick={() => onChange(index)}><small>Bar {index + 1} · {bar.label}</small><strong><Chord root={bar.root} quality={bar.quality} /></strong><span><FunctionMark value={bar.function} /></span></button>)}</div>;
}
function PracticeCard({ currentRoot, currentQuality, currentFunction, nextRoot, nextQuality, nextFunction, blues = false }: { currentRoot: KeyName; currentQuality: Quality; currentFunction: string; nextRoot: KeyName; nextQuality: Quality; nextFunction: string; blues?: boolean }) {
  return <section className="after-native-practice-card"><div><span className="eyebrow">Play now · 5 minutes</span><h2>{blues ? 'Play the 3rd and ♭7, then leave room.' : 'Play roots once. Then play only the 3rd and 7th.'}</h2><p>{blues ? 'Against the slow form, do not fill every beat. Place one guide tone on the chord change, then let the note breathe before you answer it.' : 'Set your metronome slow. Stay in one area of the neck and make every chord change with the nearest available note.'}</p></div><ol className="after-native-steps"><li><b>1</b><span>Say the function out loud: <FunctionMark value={currentFunction} /> to <FunctionMark value={nextFunction} />.</span></li><li><b>2</b><span>Hold one tone from <Chord root={currentRoot} quality={currentQuality} />.</span></li><li><b>3</b><span>Land the nearest tone in <Chord root={nextRoot} quality={nextQuality} /> on the change.</span></li></ol></section>;
}
function TargetCards({ currentRoot, currentQuality, currentFunction, currentItems, nextRoot, nextQuality, nextFunction, nextItems, bar, total, blues = false }: { currentRoot: KeyName; currentQuality: Quality; currentFunction: string; currentItems: Tone[]; nextRoot: KeyName; nextQuality: Quality; nextFunction: string; nextItems: Tone[]; bar: number; total: number; blues?: boolean }) {
  return <section className="after-native-target-grid"><article><span className="eyebrow">Now · bar {bar}</span><h2><Chord root={currentRoot} quality={currentQuality} /></h2><p><FunctionMark value={currentFunction} /> · {blues ? 'the 3rd and ♭7 define the dominant sound.' : 'pick any tone, but hear the 3rd and 7th most clearly.'}</p><ToneGrid items={currentItems} guideOnly={blues} /></article><article><span className="eyebrow">Next · bar {bar === total ? 1 : bar + 1}</span><h2><Chord root={nextRoot} quality={nextQuality} /></h2><p><FunctionMark value={nextFunction} /> · aim for the closest {blues ? '3rd or ♭7' : '3rd or 7th'} when the bar turns.</p><ToneGrid items={nextItems} guideOnly /></article></section>;
}
function MovementCard({ currentRoot, currentQuality, nextRoot, nextQuality, onPrevious, onNext, blues = false }: { currentRoot: KeyName; currentQuality: Quality; nextRoot: KeyName; nextQuality: Quality; onPrevious: () => void; onNext: () => void; blues?: boolean }) {
  return <section className="after-native-movement"><div><span className="eyebrow">Voice leading</span><h2>{blues ? 'Let one chord answer the last.' : 'Do not restart the line every bar.'}</h2><p>{blues ? 'Stay close. A small change from the 3rd or ♭7 of the current dominant chord into the next chord says more than restarting a blues box every bar.' : 'Pick a tone in the left chord. When the chord changes, move to the nearest tone in the right chord. That small change is the sound of the progression.'}</p></div><div className="after-native-movement-line"><div><span>From</span><strong><Chord root={currentRoot} quality={currentQuality} /></strong></div><i>→</i><div><span>To</span><strong><Chord root={nextRoot} quality={nextQuality} /></strong></div></div><div className="after-native-actions"><button className="secondary-button" type="button" onClick={onPrevious}>← Previous bar</button><button className="primary-button" type="button" onClick={onNext}>Next bar →</button></div></section>;
}

function TexasFloodStudy() {
  const [active, setActive] = useState(0);
  const current = TEXAS_FORM[active]; const next = TEXAS_FORM[(active + 1) % TEXAS_FORM.length];
  const currentItems = useMemo(() => chordTones(current.root, '7'), [current.root]); const nextItems = useMemo(() => chordTones(next.root, '7'), [next.root]);
  const bars = TEXAS_FORM.map(bar => ({ ...bar, quality: '7' as Quality }));
  return <article className="after-native" data-music-context="true">
    <Header title="Texas Flood" back copy={<>Work from SRV’s guitar perspective: use <strong>G blues shapes</strong> with the entire guitar tuned down one half-step. The band sounds in G♭ concert pitch.</>} />
    <section className="after-native-grid after-native-key-card"><article><span className="eyebrow">Guitar shapes</span><strong className="after-native-key">G</strong><p>Finger and think in G.</p></article><article><span className="eyebrow">Concert pitch</span><strong className="after-native-key">G♭</strong><p>The band sounds one half-step lower.</p></article><article><span className="eyebrow">Tuning</span><strong className="after-native-tuning">E♭ A♭ D♭ G♭ B♭ E♭</strong><p>Down one semitone from standard.</p></article></section>
    <ContextGrid tune="texas" />
    <JumpNav label="Texas Flood sections"><a href="#texas-form">12-bar form</a><a href="#texas-play">Play now</a><a href="#texas-targets">Chord tones</a><a href="#texas-fretboard">Fretboard</a><a href="#texas-movement">Voice leading</a></JumpNav>
    <section id="texas-form" className="after-native-section"><div className="after-native-section-head"><div><span className="eyebrow">Slow 12-bar blues · guitar shapes in G</span><h2>Feel the space before the lick.</h2><p>Each box is one bar. Keep the basic I–IV–V form steady first; phrasing only works once the time feels unhurried.</p></div><span className="after-native-counter">Bar {active + 1} of 12</span></div><NativeBarMap bars={bars} active={active} onChange={setActive} kind="texas" /></section>
    <section id="texas-play"><PracticeCard currentRoot={current.root} currentQuality="7" currentFunction={current.function} nextRoot={next.root} nextQuality="7" nextFunction={next.function} blues /></section>
    <section id="texas-targets"><TargetCards currentRoot={current.root} currentQuality="7" currentFunction={current.function} currentItems={currentItems} nextRoot={next.root} nextQuality="7" nextFunction={next.function} nextItems={nextItems} bar={active + 1} total={12} blues /></section>
    <section id="texas-fretboard"><NativeFretboard title={<><Chord root={current.root} quality="7" /> chord tones</>} copy="Keep your hand here and find the root, 3rd, 5th, and ♭7 before you answer the next bar." items={currentItems} /></section>
    <section id="texas-movement"><MovementCard currentRoot={current.root} currentQuality="7" nextRoot={next.root} nextQuality="7" blues onPrevious={() => setActive(index => (index + 11) % 12)} onNext={() => setActive(index => (index + 1) % 12)} /></section>
  </article>;
}

function AutumnLeavesStudy() {
  const [minor, setMinor] = useState<KeyName>('G'); const [active, setActive] = useState(0); const major = relativeMajor(minor);
  const bars = A_SECTION.map((bar, index) => ({ ...bar, root: autumnRoot(minor, bar, index) })); const current = bars[active]; const next = bars[(active + 1) % bars.length];
  const currentItems = useMemo(() => chordTones(current.root, current.quality), [current.root, current.quality]); const nextItems = useMemo(() => chordTones(next.root, next.quality), [next.root, next.quality]);
  return <article className="after-native" data-music-context="true">
    <section className="after-native-hero"><div><span className="eyebrow">After Hours · Standards Library</span><h1>Autumn Leaves</h1><p>A playable tune study. Read the movement by function, land on chord tones, then make the line sound like the harmony.</p></div><div className="after-native-hero-actions"><label className="key-selector"><span>Arrangement key</span><select value={minor} onChange={event => { setMinor(event.target.value as KeyName); setActive(0); }}>{KEYS.map(key => <option key={key} value={key}>{MINOR_LABELS[key]}</option>)}</select></label><div className="after-native-presets"><button type="button" className={minor === 'G' ? 'active' : ''} onClick={() => { setMinor('G'); setActive(0); }}>Standard · G minor</button><button type="button" className={minor === 'B' ? 'active' : ''} onClick={() => { setMinor('B'); setActive(0); }}>Clapton · B minor</button></div></div></section>
    <ContextGrid tune="autumn" />
    <JumpNav label="Autumn Leaves sections"><a href="#after-map">Harmony map</a><a href="#after-play">Play now</a><a href="#after-targets">Chord tones</a><a href="#after-fretboard">Fretboard</a><a href="#after-movement">Voice leading</a></JumpNav>
    <section id="after-map" className="after-native-section"><div className="after-native-section-head"><div><span className="eyebrow">A section · {major} major → {minor} minor</span><h2>Follow the form first.</h2><p>Each box is one bar. The first four bars belong to the relative major; the final four turn toward the minor tonic.</p></div><span className="after-native-counter">Bar {active + 1} of 8</span></div><NativeBarMap bars={bars} active={active} onChange={setActive} kind="autumn" /></section>
    <section id="after-play"><PracticeCard currentRoot={current.root} currentQuality={current.quality} currentFunction={current.function} nextRoot={next.root} nextQuality={next.quality} nextFunction={next.function} /></section>
    <section id="after-targets"><TargetCards currentRoot={current.root} currentQuality={current.quality} currentFunction={current.function} currentItems={currentItems} nextRoot={next.root} nextQuality={next.quality} nextFunction={next.function} nextItems={nextItems} bar={active + 1} total={8} /></section>
    <section id="after-fretboard"><NativeFretboard title={<><Chord root={current.root} quality={current.quality} /> chord tones</>} copy="Use this six-fret window as a playable map. Root is square; every circle is a usable chord tone for the current bar." items={currentItems} /></section>
    <section id="after-movement"><MovementCard currentRoot={current.root} currentQuality={current.quality} nextRoot={next.root} nextQuality={next.quality} onPrevious={() => setActive(index => (index + 7) % 8)} onNext={() => setActive(index => (index + 1) % 8)} /></section>
  </article>;
}

export function AfterHoursAutumnLeavesApp() {
  const location = useLocation();
  return new URLSearchParams(location.search).get('standard') === 'texas-flood' ? <TexasFloodStudy /> : <AutumnLeavesStudy />;
}
