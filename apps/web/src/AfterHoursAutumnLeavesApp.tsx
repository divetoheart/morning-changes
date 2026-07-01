import { useMemo, useState } from 'react';
import { KEYS, transpose, type KeyName } from './lib/theory';

type Quality = 'm7' | '7' | 'maj7' | 'm7b5';
type Bar = { function: string; degree: '1' | '2' | '3' | '4' | '5' | '6' | '7'; quality: Quality; label: string };

type Tone = { interval: string; note: string };

const MINOR_LABELS: Record<KeyName, string> = {
  C: 'C minor', Db: 'D♭ minor', D: 'D minor', Eb: 'E♭ minor', E: 'E minor', F: 'F minor', Gb: 'G♭ minor', G: 'G minor', Ab: 'A♭ minor', A: 'A minor', Bb: 'B♭ minor', B: 'B minor'
};

const A_SECTION: Bar[] = [
  { function: 'ii', degree: '2', quality: 'm7', label: 'major ii' },
  { function: 'V', degree: '5', quality: '7', label: 'major V' },
  { function: 'I', degree: '1', quality: 'maj7', label: 'relative major' },
  { function: 'IV', degree: '4', quality: 'maj7', label: 'major IV' },
  { function: 'iiø', degree: '2', quality: 'm7b5', label: 'minor iiø' },
  { function: 'V', degree: '5', quality: '7', label: 'minor V' },
  { function: 'i', degree: '1', quality: 'm7', label: 'minor tonic' },
  { function: 'i', degree: '1', quality: 'm7', label: 'hold / loop' }
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
function rootFor(minor: KeyName, bar: Bar, index: number) {
  const major = relativeMajor(minor);
  if (index <= 3) return transpose(major, bar.degree) as KeyName;
  return transpose(minor, bar.degree) as KeyName;
}
function tones(root: KeyName, quality: Quality): Tone[] { return FORMULAS[quality].map(([interval, degree]) => ({ interval, note: transpose(root, degree) })); }
function Chord({ root, quality }: { root: string; quality: Quality }) {
  const letter = root.slice(0, 1);
  const accidental = root.slice(1);
  return <span className="chord-symbol after-native-chord"><span className="chord-root">{letter}</span>{accidental && <sup className="music-accidental">{displayNote(accidental)}</sup>}<sup className="chord-quality">{displayQuality(quality)}</sup></span>;
}
function FunctionMark({ value }: { value: string }) {
  return <span className="function-symbol"><em>{value.replace('ø', '')}</em>{value.includes('ø') && <sup>ø</sup>}</span>;
}

function TexasFloodReference() {
  return <article className="after-native" data-music-context="true">
    <section className="after-native-hero">
      <div><span className="eyebrow">After Hours · Standards Library</span><h1>Texas Flood</h1><p>Stevie Ray Vaughan’s reference: use <strong>G blues shapes</strong> with the guitar tuned down one half-step. The band sounds in G♭ concert pitch.</p></div>
      <a className="secondary-button" href="#/after-hours">← Standards Library</a>
    </section>
    <section className="after-native-grid after-native-key-card">
      <article><span className="eyebrow">Guitar shape key</span><strong className="after-native-key">G</strong><p>Think and finger the tune in G.</p></article>
      <article><span className="eyebrow">Concert key</span><strong className="after-native-key">G♭</strong><p>Everything sounds a semitone lower.</p></article>
      <article><span className="eyebrow">Tuning</span><strong className="after-native-tuning">E♭ A♭ D♭ G♭ B♭ E♭</strong><p>One half-step below standard.</p></article>
    </section>
    <section className="after-native-practice-card">
      <div><span className="eyebrow">Play now · slow blues</span><h2>Start with the 12-bar skeleton.</h2><p>Use G7 as home, C7 as IV, and D7 as V in your hands. Feel the slow space first; add vocabulary after the form is automatic.</p></div>
      <div className="after-native-progression"><span><small>I</small><b>G7</b></span><span><small>IV</small><b>C7</b></span><span><small>V</small><b>D7</b></span></div>
    </section>
  </article>;
}

export function AfterHoursAutumnLeavesApp() {
  const [minor, setMinor] = useState<KeyName>('G');
  const [activeBar, setActiveBar] = useState(0);
  const isTexasFlood = window.location.hash.includes('standard=texas-flood');
  const major = relativeMajor(minor);
  const current = A_SECTION[activeBar];
  const next = A_SECTION[(activeBar + 1) % A_SECTION.length];
  const currentRoot = rootFor(minor, current, activeBar);
  const nextRoot = rootFor(minor, next, (activeBar + 1) % A_SECTION.length);
  const currentTones = useMemo(() => tones(currentRoot, current.quality), [currentRoot, current.quality]);
  const nextTones = useMemo(() => tones(nextRoot, next.quality), [nextRoot, next.quality]);

  if (isTexasFlood) return <TexasFloodReference />;

  return <article className="after-native" data-music-context="true">
    <section className="after-native-hero">
      <div><span className="eyebrow">After Hours · Standards Library</span><h1>Autumn Leaves</h1><p>A playable tune study. Read the movement by function, land on chord tones, then make the line sound like the harmony.</p></div>
      <div className="after-native-hero-actions"><label className="key-selector"><span>Arrangement key</span><select value={minor} onChange={event => { setMinor(event.target.value as KeyName); setActiveBar(0); }}>{KEYS.map(key => <option key={key} value={key}>{MINOR_LABELS[key]}</option>)}</select></label><div className="after-native-presets"><button type="button" className={minor === 'G' ? 'active' : ''} onClick={() => { setMinor('G'); setActiveBar(0); }}>Standard · G minor</button><button type="button" className={minor === 'B' ? 'active' : ''} onClick={() => { setMinor('B'); setActiveBar(0); }}>Clapton · B minor</button></div></div>
    </section>

    <nav className="after-native-jump" aria-label="Autumn Leaves sections"><a href="#after-map">Harmony map</a><a href="#after-play">Play now</a><a href="#after-targets">Chord tones</a><a href="#after-movement">Voice leading</a></nav>

    <section id="after-map" className="after-native-section">
      <div className="after-native-section-head"><div><span className="eyebrow">A section · {major} major → {minor} minor</span><h2>Follow the form first.</h2><p>Each box is one bar. The first four bars belong to the relative major; the final four turn toward the minor tonic.</p></div><span className="after-native-counter">Bar {activeBar + 1} of 8</span></div>
      <div className="after-native-bars">{A_SECTION.map((bar, index) => { const root = rootFor(minor, bar, index); return <button key={`${bar.function}-${index}`} className={index === activeBar ? 'active' : ''} type="button" onClick={() => setActiveBar(index)}><small>Bar {index + 1} · {bar.label}</small><strong><Chord root={root} quality={bar.quality} /></strong><span><FunctionMark value={bar.function} /></span></button>; })}</div>
    </section>

    <section id="after-play" className="after-native-practice-card">
      <div><span className="eyebrow">Play now · 5 minutes</span><h2>Play roots once. Then play only the 3rd and 7th.</h2><p>Set your metronome slow. Stay in one area of the neck and make every chord change with the nearest available note.</p></div>
      <ol className="after-native-steps"><li><b>1</b><span>Say the function out loud: <FunctionMark value={current.function} /> to <FunctionMark value={next.function} />.</span></li><li><b>2</b><span>Hold one tone from <Chord root={currentRoot} quality={current.quality} />.</span></li><li><b>3</b><span>Land the nearest tone in <Chord root={nextRoot} quality={next.quality} /> on the change.</span></li></ol>
    </section>

    <section id="after-targets" className="after-native-target-grid">
      <article><span className="eyebrow">Now · bar {activeBar + 1}</span><h2><Chord root={currentRoot} quality={current.quality} /></h2><p><FunctionMark value={current.function} /> · pick any tone, but hear the 3rd and 7th most clearly.</p><div className="after-native-tones">{currentTones.map(tone => <span key={`${tone.interval}-${tone.note}`} className={tone.interval === '1' ? 'root' : ''}><small>{tone.interval}</small><b>{displayNote(tone.note)}</b></span>)}</div></article>
      <article><span className="eyebrow">Next · bar {(activeBar + 1) % 8 + 1}</span><h2><Chord root={nextRoot} quality={next.quality} /></h2><p><FunctionMark value={next.function} /> · aim for the closest 3rd or 7th when the bar turns.</p><div className="after-native-tones">{nextTones.map(tone => <span key={`${tone.interval}-${tone.note}`} className={tone.interval === '3' || tone.interval === '♭3' || tone.interval === '7' || tone.interval === '♭7' ? 'target' : ''}><small>{tone.interval}</small><b>{displayNote(tone.note)}</b></span>)}</div></article>
    </section>

    <section id="after-movement" className="after-native-movement">
      <div><span className="eyebrow">Voice leading</span><h2>Do not restart the line every bar.</h2><p>Pick a tone in the left chord. When the chord changes, move to the nearest tone in the right chord. That small change is the sound of the progression.</p></div>
      <div className="after-native-movement-line"><div><span>From</span><strong><Chord root={currentRoot} quality={current.quality} /></strong></div><i>→</i><div><span>To</span><strong><Chord root={nextRoot} quality={next.quality} /></strong></div></div>
      <div className="after-native-actions"><button className="secondary-button" type="button" onClick={() => setActiveBar(index => (index + 7) % 8)}>← Previous bar</button><button className="primary-button" type="button" onClick={() => setActiveBar(index => (index + 1) % 8)}>Next bar →</button></div>
    </section>
  </article>;
}
