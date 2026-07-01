import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { KEYS, transpose, type KeyName } from './lib/theory';

type Quality = 'm7' | '7' | 'maj7' | 'm7b5';
type Bar = { function: string; degree: '1' | '2' | '3' | '4' | '5' | '6' | '7'; quality: Quality; label: string };
type TexasBar = { function: 'I' | 'IV' | 'V'; root: KeyName; label: string };
type Tone = { interval: string; note: string };

const MINOR_LABELS: Record<KeyName, string> = {
  C: 'C minor', Db: 'D♭ minor', D: 'D minor', Eb: 'E♭ minor', E: 'E minor', F: 'F minor', Gb: 'G♭ minor', G: 'G minor', Ab: 'A♭ minor', A: 'A minor', Bb: 'B♭ minor', B: 'B minor'
};
const NOTE_VALUES: Record<KeyName, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
const CHROMATIC: KeyName[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const TUNING: Array<{ label: string; note: KeyName }> = [{ label: 'e', note: 'E' }, { label: 'B', note: 'B' }, { label: 'G', note: 'G' }, { label: 'D', note: 'D' }, { label: 'A', note: 'A' }, { label: 'E', note: 'E' }];
const WINDOW = [3, 4, 5, 6, 7, 8];

const A_SECTION: Bar[] = [
  { function: 'ii', degree: '2', quality: 'm7', label: 'major ii' },
  { function: 'V', degree: '5', quality: '7', label: 'major V' },
  { function: 'I', degree: '1', quality: 'maj7', label: 'relative major' },
  { function: 'IV', degree: '4', quality: 'maj7', label: 'major IV' },
  { function: 'iiø', degree: '2', quality: 'm7b5', label: 'minor iiø' },
  { function: 'V', degree: '5', quality: '7', label: 'minor V' },
  { function: 'i', degree: '1', quality: 'm7', label: 'minor tonic' },
  { function: 'i', degree: '1', quality: 'hold / loop' }
];

const TEXAS_FLOOD_FORM: TexasBar[] = [
  { function: 'I', root: 'G', label: 'home' }, { function: 'I', root: 'G', label: 'hold' }, { function: 'I', root: 'G', label: 'home' }, { function: 'I', root: 'G', label: 'turn' },
  { function: 'IV', root: 'C', label: 'lift' }, { function: 'IV', root: 'C', label: 'hold' },
  { function: 'I', root: 'G', label: 'home' }, { function: 'I', root: 'G', label: 'space' },
  { function: 'V', root: 'D', label: 'peak' }, { function: 'IV', root: 'C', label: 'answer' }, { function: 'I', root: 'G', label: 'resolve' }, { function: 'V', root: 'D', label: 'turnaround' }
];

const FORMULAS: Record<Quality, Array<[string, '1' | 'b3' | '3' | 'b5' | '5' | 'b7' | '7']>> = {
  m7: [['1', '1'], ['♭3', 'b3'], ['5', '5'], ['♭7', 'b7']],
  '7': [['1', '1'], ['3', '3'], ['5', '5'], ['♭7', 'b7']],
  maj7: [['1', '1'], ['3', '3'], ['5', '5'], ['7', '7']],
  m7b5: [['1', '1'], ['♭3', 'b3'], ['♭5', 'b5'], ['♭7', 'b7']]
};

function displayNote(value: string) { return value.replaceAll('bb', '♭♭').replaceAll('b', '♭').replaceAll('##', '♯♯').replaceAll('#', '♯'); }
function displayQuality(value: Quality) { return value === 'm7b5' ? 'm7♭5' : value; }
function relativeMajor(minor: KeyName) { return transpose(minor, 'b3') as KeyName; }
function rootFor(minor: KeyName, bar: Bar, index: number) { const major = relativeMajor(minor); return index <= 3 ? transpose(major, bar.degree) as KeyName : transpose(minor, bar.degree) as KeyName; }
function tones(root: KeyName, quality: Quality): Tone[] { return FORMULAS[quality].map(([interval, degree]) => ({ interval, note: transpose(root, degree) })); }
function neckNote(open: KeyName, fret: number) { return CHROMATIC[(NOTE_VALUES[open] + fret) % 12]; }
function Chord({ root, quality }: { root: string; quality: Quality }) { const letter = root.slice(0, 1); const accidental = root.slice(1); return <span className="chord-symbol after-native-chord"><span className="chord-root">{letter}</span>{accidental && <sup className="music-accidental">{displayNote(accidental)}</sup>}<sup className="chord-quality">{displayQuality(quality)}</sup></span>; }
function FunctionMark({ value }: { value: string }) { return <span className="function-symbol"><em>{value.replace('ø', '')}</em>{value.includes('ø') && <sup>ø</sup>}</span>; }

function ToneGrid({ tones: values, guideOnly = false }: { tones: Tone[]; guideOnly?: boolean }) {
  return <div className="after-native-tones">{values.map(tone => <span key={`${tone.interval}-${tone.note}`} className={guideOnly && (tone.interval === '3' || tone.interval === '♭3' || tone.interval === '7' || tone.interval === '♭7') ? 'target' : tone.interval === '1' ? 'root' : ''}><small>{tone.interval}</small><b>{displayNote(tone.note)}</b></span>)}</div>;
}

function NativeFretboard({ title, copy, chordTones }: { title: string; copy: string; chordTones: Tone[] }) {
  const toneAt = (open: KeyName, fret: number) => chordTones.find(tone => tone.note === neckNote(open, fret));
  return <section className="after-native-neck-section">
    <div className="after-native-neck-head"><div><span className="eyebrow">Fretboard window · 3rd–8th fret</span><h2>{title}</h2><p>{copy}</p></div><span>Squares = root · circles = other chord tones</span></div>
    <div className="after-native-neck-scroll" tabIndex={0} role="region" aria-label="Horizontally scrollable chord-tone fretboard">
      <div className="after-native-neck">
        <div className="after-native-neck-frets"><span></span>{WINDOW.map(fret => <span key={fret}>{fret}</span>)}</div>
        {TUNING.map(string => <div className="after-native-neck-string" key={`${string.label}-${string.note}`}><b>{string.label}</b>{WINDOW.map(fret => { const tone = toneAt(string.note, fret); return <span key={fret}>{tone && <i className={tone.interval === '1' ? 'root' : ''}><strong>{tone.interval}</strong><small>{displayNote(tone.note)}</small></i>}</span>; })}</div>)}
      </div>
    </div>
  </section>;
}

function ContextGrid({ tune }: { tune: 'autumn' | 'texas' }) {
  const cards = tune === 'autumn'
    ? [
        ['Hear the two worlds', 'Bars 1–4 live in the relative major. Bars 5–8 turn home to the minor tonic.'],
        ['Keep the line alive', 'Use a chord tone as the last note of one bar and the first note of the next.'],
        ['Earn the arpeggio', 'Play the form with roots and guide tones before you expand into full arpeggios.']
      ]
    : [
        ['The sound is in the space', 'The slow feel makes silence part of the phrase. Leave a beat after a strong note.'],
        ['Hear dominant color', 'The 3rd and ♭7 identify each dominant chord more clearly than a memorized blues box.'],
        ['Build the answer', 'Let the V bar point into IV, then resolve home with a small melodic answer.']
      ];
  return <section className="after-native-context-grid">{cards.map(([title, copy]) => <article key={title}><span className="eyebrow">{tune === 'autumn' ? 'Tune logic' : 'Slow blues logic'}</span><h3>{title}</h3><p>{copy}</p></article>)}</section>;
}

function TexasFloodStudy() {
  const [activeBar, setActiveBar] = useState(0);
  const current = TEXAS_FLOOD_FORM[activeBar];
  const next = TEXAS_FLOOD_FORM[(activeBar + 1) % TEXAS_FLOOD_FORM.length];
  const currentTones = useMemo(() => tones(current.root, '7'), [current.root]);
  const nextTones = useMemo(() => tones(next.root, '7'), [next.root]);

  return <article className="after-native" data-music-context="true">
    <section className="after-native-hero">
      <div><span className="eyebrow">After Hours · Standards Library</span><h1>Texas Flood</h1><p>Work from SRV’s guitar perspective: use G blues shapes with the entire guitar tuned down one half-step. The band sounds in G♭ concert pitch.</p></div>
      <a className="secondary-button" href="#/after-hours">← Standards Library</a>
    </section>

    <section className="after-native-grid after-native-key-card">
      <article><span className="eyebrow">Guitar shapes</span><strong className="after-native-key">G</strong><p>Finger and think in G.</p></article>
      <article><span className="eyebrow">Concert pitch</span><strong className="after-native-key">G♭</strong><p>The band sounds one half-step lower.</p></article>
      <article><span className="eyebrow">Tuning</span><strong className="after-native-tuning">E♭ A♭ D♭ G♭ B♭ E♭</strong><p>Down one semitone from standard.</p></article>
    </section>

    <ContextGrid tune="texas" />
    <nav className="after-native-jump" aria-label="Texas Flood sections"><a href="#texas-form">12-bar form</a><a href="#texas-play">Play now</a><a href="#texas-targets">Chord tones</a><a href="#texas-fretboard">Fretboard</a><a href="#texas-movement">Voice leading</a></nav>

    <section id="texas-form" className="after-native-section">
      <div className="after-native-section-head"><div><span className="eyebrow">Slow 12-bar blues · guitar shapes in G</span><h2>Feel the space before the lick.</h2><p>Each box is one bar. Keep the basic I–IV–V form steady first; phrasing only works once the time feels unhurried.</p></div><span className="after-native-counter">Bar {activeBar + 1} of 12</span></div>
      <div className="after-native-bars texas-bars">{TEXAS_FLOOD_FORM.map((bar, index) => <button key={`${bar.function}-${index}`} className={index === activeBar ? 'active' : ''} type="button" onClick={() => setActiveBar(index)}><small>Bar {index + 1} · {bar.label}</small><strong><Chord root={bar.root} quality="7" /></strong><span><FunctionMark value={bar.function} /></span></button>)}</div>
    </section>

    <section id="texas-play" className="after-native-practice-card">
      <div><span className="eyebrow">Play now · 5 minutes</span><h2>Play the 3rd and ♭7, then leave room.</h2><p>Against the slow form, do not fill every beat. Place one guide tone on the chord change, then let the note breathe before you answer it.</p></div>
      <ol className="after-native-steps"><li><b>1</b><span>Count the bar and name <FunctionMark value={current.function} /> before you play.</span></li><li><b>2</b><span>Land the 3rd or ♭7 of <Chord root={current.root} quality="7" />.</span></li><li><b>3</b><span>When the form moves, answer with the nearest guide tone in <Chord root={next.root} quality="7" />.</span></li></ol>
    </section>

    <section id="texas-targets" className="after-native-target-grid">
      <article><span className="eyebrow">Now · bar {activeBar + 1}</span><h2><Chord root={current.root} quality="7" /></h2><p><FunctionMark value={current.function} /> · the 3rd and ♭7 define the dominant sound.</p><ToneGrid tones={currentTones} guideOnly /></article>
      <article><span className="eyebrow">Next · bar {activeBar + 1 === 12 ? 1 : activeBar + 2}</span><h2><Chord root={next.root} quality="7" /></h2><p><FunctionMark value={next.function} /> · move only as far as you need to make the change clear.</p><ToneGrid tones={nextTones} guideOnly /></article>
    </section>

    <section id="texas-fretboard"><NativeFretboard title={<><Chord root={current.root} quality="7" /> chord tones</>} copy="Keep your hand here and find the root, 3rd, 5th, and ♭7 before you answer the next bar." chordTones={currentTones} /></section>

    <section id="texas-movement" className="after-native-movement">
      <div><span className="eyebrow">Voice leading</span><h2>Let one chord answer the last.</h2><p>Stay close. A small change from the 3rd or ♭7 of the current dominant chord into the next chord says more than restarting a blues box every bar.</p></div>
      <div className="after-native-movement-line"><div><span>From</span><strong><Chord root={current.root} quality="7" /></strong></div><i>→</i><div><span>To</span><strong><Chord root={next.root} quality="7" /></strong></div></div>
      <div className="after-native-actions"><button className="secondary-button" type="button" onClick={() => setActiveBar(index => (index + 11) % 12)}>← Previous bar</button><button className="primary-button" type="button" onClick={() => setActiveBar(index => (index + 1) % 12)}>Next bar →</button></div>
    </section>
  </article>;
}

function AutumnLeavesStudy() {
  const [minor, setMinor] = useState<KeyName>('G');
  const [activeBar, setActiveBar] = useState(0);
  const major = relativeMajor(minor);
  const current = A_SECTION[activeBar];
  const next = A_SECTION[(activeBar + 1) % A_SECTION.length];
  const currentRoot = rootFor(minor, current, activeBar);
  const nextRoot = rootFor(minor, next, (activeBar + 1) % A_SECTION.length);
  const currentTones = useMemo(() => tones(currentRoot, current.quality), [currentRoot, current.quality]);
  const nextTones = useMemo(() => tones(nextRoot, next.quality), [nextRoot, next.quality]);

  return <article className="after-native" data-music-context="true">
    <section className="after-native-hero">
      <div><span className="eyebrow">After Hours · Standards Library</span><h1>Autumn Leaves</h1><p>A playable tune study. Read the movement by function, land on chord tones, then make the line sound like the harmony.</p></div>
      <div className="after-native-hero-actions"><label className="key-selector"><span>Arrangement key</span><select value={minor} onChange={event => { setMinor(event.target.value as KeyName); setActiveBar(0); }}>{KEYS.map(key => <option key={key} value={key}>{MINOR_LABELS[key]}</option>)}</select></label><div className="after-native-presets"><button type="button" className={minor === 'G' ? 'active' : ''} onClick={() => { setMinor('G'); setActiveBar(0); }}>Standard · G minor</button><button type="button" className={minor === 'B' ? 'active' : ''} onClick={() => { setMinor('B'); setActiveBar(0); }}>Clapton · B minor</button></div></div>
    </section>

    <ContextGrid tune="autumn" />
    <nav className="after-native-jump" aria-label="Autumn Leaves sections"><a href="#after-map">Harmony map</a><a href="#after-play">Play now</a><a href="#after-targets">Chord tones</a><a href="#after-fretboard">Fretboard</a><a href="#after-movement">Voice leading</a></nav>

    <section id="after-map" className="after-native-section">
      <div className="after-native-section-head"><div><span className="eyebrow">A section · {major} major → {minor} minor</span><h2>Follow the form first.</h2><p>Each box is one bar. The first four bars belong to the relative major; the final four turn toward the minor tonic.</p></div><span className="after-native-counter">Bar {activeBar + 1} of 8</span></div>
      <div className="after-native-bars">{A_SECTION.map((bar, index) => { const root = rootFor(minor, bar, index); return <button key={`${bar.function}-${index}`} className={index === activeBar ? 'active' : ''} type="button" onClick={() => setActiveBar(index)}><small>Bar {index + 1} · {bar.label}</small><strong><Chord root={root} quality={bar.quality} /></strong><span><FunctionMark value={bar.function} /></span></button>; })}</div>
    </section>

    <section id="after-play" className="after-native-practice-card">
      <div><span className="eyebrow">Play now · 5 minutes</span><h2>Play roots once. Then play only the 3rd and 7th.</h2><p>Set your metronome slow. Stay in one area of the neck and make every chord change with the nearest available note.</p></div>
      <ol className="after-native-steps"><li><b>1</b><span>Say the function out loud: <FunctionMark value={current.function} /> to <FunctionMark value={next.function} />.</span></li><li><b>2</b><span>Hold one tone from <Chord root={currentRoot} quality={current.quality} />.</span></li><li><b>3</b><span>Land the nearest tone in <Chord root={nextRoot} quality={next.quality} /> on the change.</span></li></ol>
    </section>

    <section id="after-targets" className="after-native-target-grid">
      <article><span className="eyebrow">Now · bar {activeBar + 1}</span><h2><Chord root={currentRoot} quality={current.quality} /></h2><p><FunctionMark value={current.function} /> · pick any tone, but hear the 3rd and 7th most clearly.</p><ToneGrid tones={currentTones} /></article>
      <article><span className="eyebrow">Next · bar {(activeBar + 1) % 8 + 1}</span><h2><Chord root={nextRoot} quality={next.quality} /></h2><p><FunctionMark value={next.function} /> · aim for the closest 3rd or 7th when the bar turns.</p><ToneGrid tones={nextTones} guideOnly /></article>
    </section>

    <section id="after-fretboard"><NativeFretboard title={<><Chord root={currentRoot} quality={current.quality} /> chord tones</>} copy="Use this six-fret window as a playable map. Root is square; every circle is a usable chord tone for the current bar." chordTones={currentTones} /></section>

    <section id="after-movement" className="after-native-movement">
      <div><span className="eyebrow">Voice leading</span><h2>Do not restart the line every bar.</h2><p>Pick a tone in the left chord. When the chord changes, move to the nearest tone in the right chord. That small change is the sound of the progression.</p></div>
      <div className="after-native-movement-line"><div><span>From</span><strong><Chord root={currentRoot} quality={current.quality} /></strong></div><i>→</i><div><span>To</span><strong><Chord root={nextRoot} quality={next.quality} /></strong></div></div>
      <div className="after-native-actions"><button className="secondary-button" type="button" onClick={() => setActiveBar(index => (index + 7) % 8)}>← Previous bar</button><button className="primary-button" type="button" onClick={() => setActiveBar(index => (index + 1) % 8)}>Next bar →</button></div>
    </section>
  </article>;
}

export function AfterHoursAutumnLeavesApp() {
  const location = useLocation();
  return new URLSearchParams(location.search).get('standard') === 'texas-flood' ? <TexasFloodStudy /> : <AutumnLeavesStudy />;
}
