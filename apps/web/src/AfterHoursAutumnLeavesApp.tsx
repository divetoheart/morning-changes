import { useMemo, useState } from 'react';
import { KEYS, transpose, type KeyName } from './lib/theory';

const MINOR_LABELS: Record<KeyName, string> = {
  C: 'C minor', Db: 'D♭ minor', D: 'D minor', Eb: 'E♭ minor', E: 'E minor', F: 'F minor', Gb: 'G♭ minor', G: 'G minor', Ab: 'A♭ minor', A: 'A minor', Bb: 'B♭ minor', B: 'B minor'
};

type Quality = 'm7' | '7' | 'maj7' | 'm7b5';
type Tone = { interval: string; note: string; semitone: number };
type Bar = { function: string; root: string; quality: Quality; tones: Tone[] };

const NOTE_VALUES: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
const NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const TUNING = [{ label: 'e', note: 'E' }, { label: 'B', note: 'B' }, { label: 'G', note: 'G' }, { label: 'D', note: 'D' }, { label: 'A', note: 'A' }, { label: 'E', note: 'E' }];
const FORMULAS: Record<Quality, Array<[string, number]>> = {
  m7: [['1', 0], ['♭3', 3], ['5', 7], ['♭7', 10]],
  '7': [['1', 0], ['3', 4], ['5', 7], ['♭7', 10]],
  maj7: [['1', 0], ['3', 4], ['5', 7], ['7', 11]],
  m7b5: [['1', 0], ['♭3', 3], ['♭5', 6], ['♭7', 10]]
};

function prettyNote(note: string) { return note.replaceAll('bb', '♭♭').replaceAll('b', '♭').replaceAll('##', '♯♯').replaceAll('#', '♯'); }
function qualityLabel(quality: Quality) { return quality === 'm7b5' ? 'm7♭5' : quality; }
function addSemitone(root: string, semitone: number) { return NOTES[(NOTE_VALUES[root] + semitone + 12) % 12]; }
function tones(root: string, quality: Quality): Tone[] { return FORMULAS[quality].map(([interval, semitone]) => ({ interval, note: addSemitone(root, semitone), semitone })); }

function buildBars(minor: KeyName): Bar[] {
  const relativeMajor = transpose(minor, 'b3') as KeyName;
  const roots = [
    transpose(relativeMajor, '2'), transpose(relativeMajor, '5'), relativeMajor, transpose(relativeMajor, '4'),
    transpose(minor, '2'), transpose(minor, '5'), minor, minor
  ];
  const qualities: Quality[] = ['m7', '7', 'maj7', 'maj7', 'm7b5', '7', 'm7', 'm7'];
  const functions = ['ii', 'V', 'I', 'IV', 'iiø', 'V', 'i', 'i'];
  return roots.map((root, index) => ({ function: functions[index], root, quality: qualities[index], tones: tones(root, qualities[index]) }));
}

function Chord({ root, quality }: { root: string; quality: Quality }) {
  const letter = root[0]; const accidental = root.slice(1);
  return <span className="chord-symbol after-chord"><span className="chord-root">{letter}</span>{accidental && <sup className="music-accidental">{prettyNote(accidental)}</sup>}<sup className="chord-quality">{qualityLabel(quality)}</sup></span>;
}
function Function({ value }: { value: string }) { const numeral = value.replace('ø', ''); return <span className="function-symbol"><em>{numeral}</em>{value.includes('ø') && <sup>ø</sup>}</span>; }

export function AfterHoursAutumnLeavesApp() {
  const [minorKey, setMinorKey] = useState<KeyName>('G');
  const [barIndex, setBarIndex] = useState(0);
  const [position, setPosition] = useState(5);
  const bars = useMemo(() => buildBars(minorKey), [minorKey]);
  const bar = bars[barIndex];
  const next = bars[(barIndex + 1) % bars.length];

  const selectKey = (key: KeyName) => { setMinorKey(key); setBarIndex(0); };

  return <div className="app-shell after-hours-app">
    <header className="app-topbar">
      <a className="wordmark" href="#/"><span className="wordmark-mark">◒</span><span><strong>Morning Changes</strong><small>After Hours · tune study</small></span></a>
      <nav className="desktop-nav"><a href="#/">Home</a><a href="#/learn">Learn</a><a className="active" href="#/after-hours">After</a><a href="#/tools">Tools</a></nav>
      <a className="tempo-button" href="#/after-hours">After Hours</a>
    </header>

    <main className="screen after-hours-screen">
      <nav className="lesson-breadcrumb"><a href="#/after-hours">← After Hours</a><span>Standard study</span></nav>
      <section className="after-hero">
        <span className="eyebrow">Autumn Leaves</span>
        <h1>A tune hub, not a different site.</h1>
        <p>Use the same language from the lessons here: function first, chord tones second, notes last. Pick an arrangement key and keep the workflow inside Morning Changes.</p>
      </section>

      <section className="after-control-panel">
        <div><span className="eyebrow">Arrangement key</span><h2>{MINOR_LABELS[minorKey]}</h2><p>The harmonic map stays consistent while chord names, targets, and the fretboard redraw.</p></div>
        <div className="after-key-controls">
          <label className="key-selector"><span>Minor key</span><select value={minorKey} onChange={event => selectKey(event.target.value as KeyName)}>{KEYS.map(key => <option key={key} value={key}>{MINOR_LABELS[key]}</option>)}</select></label>
          <div className="after-presets"><button className={minorKey === 'G' ? 'active' : ''} type="button" onClick={() => selectKey('G')}>Standard · G minor</button><button className={minorKey === 'C' ? 'active' : ''} type="button" onClick={() => selectKey('C')}>Clapton · C minor</button></div>
        </div>
      </section>

      <section className="function-map" data-music-context="true">
        <div className="function-map-head"><div><span className="eyebrow">A section · eight-bar map</span><h2>Follow the movement.</h2></div><span className="function-map-note">One chord per bar</span></div>
        <div className="bar-grid">{bars.map((item, index) => <button className={index === barIndex ? 'active' : ''} type="button" key={`${item.root}-${index}`} onClick={() => setBarIndex(index)}><small>Bar {index + 1}</small><strong><Chord root={item.root} quality={item.quality} /></strong><span><Function value={item.function} /></span></button>)}</div>
      </section>

      <section className="after-current" data-music-context="true">
        <div><span className="eyebrow">Now</span><h2><Chord root={bar.root} quality={bar.quality} /></h2><p><Function value={bar.function} /> · target the shape by function, then land a chord tone.</p></div>
        <div className="after-current-actions"><button className="secondary-button" type="button" onClick={() => setBarIndex((barIndex + 7) % bars.length)}>← Previous</button><button className="primary-button" type="button" onClick={() => setBarIndex((barIndex + 1) % bars.length)}>Next bar →</button></div>
      </section>

      <section className="after-targets" data-music-context="true">
        <div><span className="eyebrow">Chord-tone targets</span><h2>Read the colors once.</h2></div>
        <div className="target-row">{bar.tones.map(tone => <div className={tone.interval === '1' ? 'target root' : 'target'} key={tone.interval}><span className="interval-symbol">{tone.interval}</span><strong>{prettyNote(tone.note)}</strong></div>)}</div>
        <p>Root is the anchor. The other three tones are your line choices. Move to the nearest one when the bar changes.</p>
      </section>

      <section className="after-fretboard" data-music-context="true">
        <div className="fretboard-panel-head"><div><span className="eyebrow">Fretboard visual</span><h2>{position}th position · <Chord root={bar.root} quality={bar.quality} /></h2><p>Large square = root. Small dots = the other chord tones. This is a chord-tone map, not a random scale cloud.</p></div><div className="position-buttons">{[3, 5, 7, 8, 10].map(value => <button key={value} type="button" className={position === value ? 'active' : ''} onClick={() => setPosition(value)}>{value}th</button>)}</div></div>
        <ChordToneNeck bar={bar} startFret={position} />
      </section>

      <section className="after-route" data-music-context="true">
        <article><span className="eyebrow">Make the change</span><h3><Chord root={bar.root} quality={bar.quality} /> <span>→</span> <Chord root={next.root} quality={next.quality} /></h3><p>Before you move, choose the closest <span className="interval-symbol">3</span> or <span className="interval-symbol">7</span> in the next chord. Let the smallest note movement lead your phrase.</p></article>
        <article><span className="eyebrow">Study paths</span><h3>Continue the lesson work</h3><div className="after-route-links"><a href="#/lesson/guide-tones-major-ii-v-i">Guide tones</a><a href="#/lesson/arpeggios-as-chord-tones">Arpeggios</a></div></article>
      </section>
    </main>

    <nav className="bottom-nav"><a href="#/"><span>⌂</span><small>Home</small></a><a href="#/learn"><span>▤</span><small>Learn</small></a><a href="#/paths"><span>◉</span><small>Paths</small></a><a className="active" href="#/after-hours"><span>♫</span><small>After</small></a><a href="#/tools"><span>⚙</span><small>Tools</small></a><a href="#/progress"><span>↗</span><small>Progress</small></a></nav>
  </div>;
}

function ChordToneNeck({ bar, startFret }: { bar: Bar; startFret: number }) {
  const frets = Array.from({ length: 6 }, (_, index) => startFret + index);
  const toneFor = (open: string, fret: number) => {
    const note = NOTES[(NOTE_VALUES[open] + fret) % 12];
    return bar.tones.find(tone => tone.note === note);
  };
  return <div className="after-neck-scroll"><div className="after-neck"><div className="after-frets"><span></span>{frets.map(fret => <span key={fret}>{fret}</span>)}</div>{TUNING.map(string => <div className="after-string" key={string.label + string.note}><b>{string.label}</b>{frets.map(fret => { const tone = toneFor(string.note, fret); return <span key={fret}>{tone && <i className={tone.interval === '1' ? 'root' : ''}><strong>{tone.interval}</strong><small>{prettyNote(tone.note)}</small></i>}</span>; })}</div>)}</div></div>;
}
