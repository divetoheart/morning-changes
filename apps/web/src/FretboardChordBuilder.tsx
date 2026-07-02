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

const CHORD_INTERVALS: readonly IntervalName[] = ['1', 'b2', '2', 'b3', '3', '4', '#4', 'b5', '5', '#5', '6', 'b7', '7'];

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
      : CHORD_INTERVALS.filter(value => value === '1' || previous.includes(value) || value === interval));
  };

  return <section className="fretboard-chord-builder" aria-label="Chord builder">
    <div className="fretboard-chord-builder-head"><div><span className="eyebrow">Active chord</span><h3>Build what you want to inspect.</h3><p>Type a familiar chord symbol, or add intervals one note at a time. The neck only receives structured engine chord data.</p></div><strong>{result.chord ? chordSymbol(result.chord) : 'Waiting for a chord'}</strong></div>
    <div className="fretboard-builder-tabs" role="tablist" aria-label="Chord input method">
      <button type="button" className={entryMode === 'symbol' ? 'active' : ''} aria-selected={entryMode === 'symbol'} onClick={() => setEntryMode('symbol')}>Type a symbol</button>
      <button type="button" className={entryMode === 'tones' ? 'active' : ''} aria-selected={entryMode === 'tones'} onClick={() => setEntryMode('tones')}>Build from tones</button>
    </div>
    {entryMode === 'symbol'
      ? <label className="fretboard-symbol-input"><span>Chord symbol</span><input value={symbol} onChange={event => setSymbol(event.target.value)} inputMode="text" spellCheck="false" placeholder="Cmaj7, F♯7, B♭m7" aria-describedby="fretboard-symbol-help" /><small id="fretboard-symbol-help">Supported: major, minor, 7, maj7, m7, m7♭5, dim, aug, sus2, and sus4.</small></label>
      : <div className="fretboard-tone-builder"><div className="fretboard-tone-grid">{CHORD_INTERVALS.map(interval => { const isRoot = interval === '1'; const selected = selectedIntervals.includes(interval); const note = noteToString(transposeNote(root, interval)); return <button type="button" key={interval} className={selected ? 'active' : ''} disabled={isRoot} aria-pressed={selected} onClick={() => toggleInterval(interval)}><strong>{interval}</strong><small>{note}</small></button>; })}</div><p>Root <b>1</b> stays on. Select the color tones you want the chord to contain.</p></div>}
    {result.error && <p className="fretboard-builder-error" role="status">{result.error}</p>}
    {result.chord && <div className="fretboard-builder-tones"><span>On the neck</span>{result.chord.tones.map(tone => <b key={tone.interval}>{tone.interval} · {noteToString(tone.note)}</b>)}</div>}
  </section>;
}
