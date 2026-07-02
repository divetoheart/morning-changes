import { useEffect, useMemo, useState } from 'react';
import {
  buildCustomChord,
  chordSymbol,
  noteToString,
  parseChordSymbol,
  parseNote,
  transposeNote,
  type Chord,
  type IntervalName,
  type StudyMode
} from './lib/music';

const CORE_INTERVALS: readonly IntervalName[] = ['1', 'b2', '2', 'b3', '3', '4', '#4', 'b5', '5', '#5', '6', 'b7', '7'];
const EXTENSION_INTERVALS: readonly IntervalName[] = ['b9', '9', '#9', '11', '#11', 'b13', '13'];
const SUS_PRESETS: ReadonlyArray<{ label: string; intervals: readonly IntervalName[] }> = [
  { label: 'Sus2', intervals: ['1', '2', '5'] },
  { label: 'Sus4', intervals: ['1', '4', '5'] }
];

type BuilderMode = 'symbol' | 'tones';

type Props = {
  tonic: string;
  studyMode: StudyMode;
  onChordChange: (chord: Chord) => void;
};

function defaultSymbol(tonic: string, studyMode: StudyMode) {
  return `${tonic}${studyMode === 'major' ? 'maj7' : 'm7'}`;
}

function defaultIntervals(studyMode: StudyMode): IntervalName[] {
  return studyMode === 'major' ? ['1', '3', '5', '7'] : ['1', 'b3', '5', 'b7'];
}

/** Main-Fretboard-only chord entry. Standards keep their own authored chord lists. */
export function FretboardChordBuilder({ tonic, studyMode, onChordChange }: Props) {
  const [entryMode, setEntryMode] = useState<BuilderMode>('symbol');
  const [symbol, setSymbol] = useState(() => defaultSymbol(tonic, studyMode));
  const [selectedIntervals, setSelectedIntervals] = useState<IntervalName[]>(() => defaultIntervals(studyMode));

  const symbolResult = useMemo(() => {
    try { return { chord: parseChordSymbol(symbol), error: null as string | null }; }
    catch (error) { return { chord: null, error: error instanceof Error ? error.message : 'Enter a supported chord symbol.' }; }
  }, [symbol]);
  const toneResult = useMemo(() => {
    try { return { chord: buildCustomChord(tonic, selectedIntervals), error: null as string | null }; }
    catch (error) { return { chord: null, error: error instanceof Error ? error.message : 'Add at least one chord tone.' }; }
  }, [selectedIntervals, tonic]);
  const result = entryMode === 'symbol' ? symbolResult : toneResult;
  const root = useMemo(() => parseNote(tonic), [tonic]);

  useEffect(() => {
    if (result.chord) onChordChange(result.chord);
  }, [onChordChange, result.chord]);

  const toggleInterval = (interval: IntervalName) => {
    if (interval === '1') return;
    setSelectedIntervals(previous => previous.includes(interval)
      ? previous.filter(value => value !== interval)
      : [...previous, interval]);
  };
  const applyPreset = (intervals: readonly IntervalName[]) => setSelectedIntervals([...intervals]);
  const renderIntervalButton = (interval: IntervalName) => {
    const isRoot = interval === '1';
    const selected = selectedIntervals.includes(interval);
    const note = noteToString(transposeNote(root, interval));
    return <button type="button" key={interval} className={selected ? 'active' : ''} disabled={isRoot} aria-pressed={selected} onClick={() => toggleInterval(interval)}><strong>{interval}</strong><small>{note}</small></button>;
  };

  return <section className="fretboard-chord-builder" aria-label="Chord builder">
    <div className="fretboard-chord-builder-head"><div><span className="eyebrow">Active chord</span><h3>Build what you want to inspect.</h3><p>Type a chord symbol, or add intervals one note at a time. The neck only receives structured engine chord data.</p></div><strong>{result.chord ? chordSymbol(result.chord) : 'Waiting for a chord'}</strong></div>
    <div className="fretboard-builder-tabs" role="tablist" aria-label="Chord input method">
      <button type="button" className={entryMode === 'symbol' ? 'active' : ''} aria-selected={entryMode === 'symbol'} onClick={() => setEntryMode('symbol')}>Type a symbol</button>
      <button type="button" className={entryMode === 'tones' ? 'active' : ''} aria-selected={entryMode === 'tones'} onClick={() => setEntryMode('tones')}>Build from tones</button>
    </div>
    {entryMode === 'symbol'
      ? <label className="fretboard-symbol-input"><span>Chord symbol</span><input value={symbol} onChange={event => setSymbol(event.target.value)} inputMode="text" spellCheck="false" placeholder="C9, F13, B♭add9, Dm11" aria-describedby="fretboard-symbol-help" /><small id="fretboard-symbol-help">Supported: major, minor, 7, maj7, m7, 9, 11, 13, maj9–13, m9–13, add9–13, dim, aug, sus / sus2 / sus4.</small></label>
      : <div className="fretboard-tone-builder"><div className="fretboard-tone-section"><span>Chord tones</span><div className="fretboard-tone-grid">{CORE_INTERVALS.map(renderIntervalButton)}</div></div><div className="fretboard-tone-section"><span>Extensions</span><div className="fretboard-tone-grid fretboard-extension-grid">{EXTENSION_INTERVALS.map(renderIntervalButton)}</div></div><div className="fretboard-sus-presets" aria-label="Suspended chord presets"><span>Suspended</span>{SUS_PRESETS.map(preset => <button type="button" key={preset.label} className={preset.intervals.length === selectedIntervals.length && preset.intervals.every(interval => selectedIntervals.includes(interval)) ? 'active' : ''} onClick={() => applyPreset(preset.intervals)}>{preset.label}</button>)}</div><p>Root <b>1</b> stays on. Add the color tones you want the chord to contain.</p></div>}
    {result.error && <p className="fretboard-builder-error" role="status">{result.error}</p>}
    {result.chord && <div className="fretboard-builder-tones"><span>On the neck</span>{result.chord.tones.map(tone => <b key={tone.interval}>{tone.interval} · {noteToString(tone.note)}</b>)}</div>}
  </section>;
}
