import { useEffect, useMemo, useState } from 'react';
import type { ArpType } from './after-hours-types';
import { CAGED_POSITIONS, PENTATONIC_BOXES } from './after-hours-shapes';
import { assertMusicEngineContract } from './lib/music/contract';
import {
  buildChord,
  createKey,
  DEFAULT_FRET_RANGE,
  displayStringOrder,
  noteToString,
  parseNote,
  positionsForChord,
  positionsForIntervals,
  positionsForScale,
  STANDARD_TUNING,
  type ChordQuality,
  type ScaleMode
} from './lib/music';

if (import.meta.env.DEV) assertMusicEngineContract();

type Layer = 'caged' | 'pentatonic' | 'arpeggio' | 'scale';
type LayerDot = { layer: Layer; label: string; root: boolean };
type ChordOption = { label: string; root?: string; quality?: ArpType };

type FretboardMapProps = {
  keyLabel: string;
  majorRoot: string;
  minorRoot: string;
  chords: ChordOption[];
  description: string;
  cagedLabel: string;
  pentatonicLabel: string;
  defaultLayers?: Partial<Record<Layer, boolean>>;
  mode?: 'layers' | 'roots';
  eyebrow?: string;
  heading?: string;
};

const FRET_COUNT = DEFAULT_FRET_RANGE.end - DEFAULT_FRET_RANGE.start + 1;
const DISPLAY_STRINGS = displayStringOrder(STANDARD_TUNING).map(source => ({
  source,
  label: source === STANDARD_TUNING.openStrings.length - 1 ? 'e' : noteToString(STANDARD_TUNING.openStrings[source])
}));
const LAYERS: Array<{ id: Layer; label: string; detail: string }> = [
  { id: 'caged', label: 'CAGED', detail: 'major-key positions' },
  { id: 'pentatonic', label: 'Pentatonic', detail: 'five connected boxes' },
  { id: 'arpeggio', label: 'Arpeggio', detail: 'active chord tones' },
  { id: 'scale', label: 'Scale', detail: 'active chord scale' }
];
const DEFAULT_LAYERS: Record<Layer, boolean> = { caged: false, pentatonic: true, arpeggio: true, scale: false };
const ENGINE_CHORD_QUALITY: Record<ArpType, ChordQuality> = {
  maj7: 'major7',
  m7: 'minor7',
  '7': 'dominant7',
  m7b5: 'halfDiminished7'
};
const ENGINE_SCALE_MODE: Record<ArpType, ScaleMode> = {
  maj7: 'major',
  m7: 'dorian',
  '7': 'mixolydian',
  m7b5: 'locrian'
};

function rootForLabel(label: string) {
  return label.match(/^([A-G](?:♭|♯|b|#)?)/)?.[1] ?? 'C';
}
function qualityForLabel(label: string): ArpType {
  const suffix = label.replace(/^([A-G](?:♭|♯|b|#)?)/, '');
  return suffix.includes('m7♭5') ? 'm7b5' : suffix.includes('maj7') ? 'maj7' : suffix.includes('m') ? 'm7' : '7';
}
function cellKey(source: number, fret: number) {
  return `${source}:${fret}`;
}
function buildPatternSet(patterns: ReadonlyArray<ReadonlyArray<readonly [number, number, string]>>, anchor: number) {
  const set = new Map<string, string>();
  for (const shift of [-24, -12, 0, 12, 24]) {
    for (const pattern of patterns) {
      for (const [source, offset, label] of pattern) {
        const fret = anchor + offset + shift;
        if (fret >= DEFAULT_FRET_RANGE.start && fret <= DEFAULT_FRET_RANGE.end) set.set(cellKey(source, fret), label);
      }
    }
  }
  return set;
}
function intervalMap(entries: Array<{ stringIndex: number; fret: number; interval: string }>) {
  return new Map(entries.map(entry => [cellKey(entry.stringIndex, entry.fret), entry.interval]));
}

/**
 * Shared neck renderer. The active root, chord tones, scale tones, tuning, and
 * display-string order now come from lib/music. Legacy physical CAGED/pentatonic
 * templates remain isolated until their validation/migration phase is complete.
 */
export function FretboardMap({ keyLabel, majorRoot, minorRoot, chords, description, cagedLabel, pentatonicLabel, defaultLayers, mode = 'layers', eyebrow = 'Shapes and voicings', heading = 'One neck. Every map you need.' }: FretboardMapProps) {
  const [enabled, setEnabled] = useState<Record<Layer, boolean>>({ ...DEFAULT_LAYERS, ...defaultLayers });
  const [activeChordLabel, setActiveChordLabel] = useState(chords[0]?.label ?? 'C');
  const chordSignature = chords.map(chord => chord.label).join('|');
  useEffect(() => { setActiveChordLabel(chords[0]?.label ?? 'C'); }, [chordSignature]);

  const activeChord = chords.find(chord => chord.label === activeChordLabel) ?? chords[0] ?? { label: 'C7' };
  const activeRootLabel = activeChord.root ?? rootForLabel(activeChord.label);
  const activeQuality = activeChord.quality ?? qualityForLabel(activeChord.label);
  const majorRootNote = useMemo(() => parseNote(majorRoot), [majorRoot]);
  const minorRootNote = useMemo(() => parseNote(minorRoot), [minorRoot]);
  const activeRootNote = useMemo(() => parseNote(activeRootLabel), [activeRootLabel]);

  const cagedAnchor = (majorRootNote.pitchClass - STANDARD_TUNING.openStrings[0].pitchClass + 12) % 12;
  const pentatonicAnchor = (minorRootNote.pitchClass - STANDARD_TUNING.openStrings[0].pitchClass + 12) % 12;
  const cagedSet = useMemo(() => buildPatternSet(CAGED_POSITIONS.map(item => item.offsets), cagedAnchor), [cagedAnchor]);
  const pentatonicSet = useMemo(() => buildPatternSet(PENTATONIC_BOXES, pentatonicAnchor), [pentatonicAnchor]);
  const arpeggioSet = useMemo(() => intervalMap(positionsForChord(buildChord(activeRootNote, ENGINE_CHORD_QUALITY[activeQuality]))), [activeRootNote, activeQuality]);
  const scaleSet = useMemo(() => intervalMap(positionsForScale(createKey(activeRootNote, ENGINE_SCALE_MODE[activeQuality]))), [activeRootNote, activeQuality]);
  const rootSet = useMemo(() => new Set(positionsForIntervals(activeRootNote, ['1'], 'root').map(position => cellKey(position.stringIndex, position.fret))), [activeRootNote]);
  const frets = Array.from({ length: FRET_COUNT }, (_, index) => DEFAULT_FRET_RANGE.start + index);

  const dotsFor = (string: typeof DISPLAY_STRINGS[number], fret: number): LayerDot[] => {
    if (mode === 'roots') return rootSet.has(cellKey(string.source, fret)) ? [{ layer: 'arpeggio', label: '1', root: true }] : [];
    const dots: LayerDot[] = [];
    const caged = cagedSet.get(cellKey(string.source, fret));
    const pentatonic = pentatonicSet.get(cellKey(string.source, fret));
    const arpeggio = arpeggioSet.get(cellKey(string.source, fret));
    const scale = scaleSet.get(cellKey(string.source, fret));
    if (enabled.caged && caged) dots.push({ layer: 'caged', label: caged, root: caged === '1' });
    if (enabled.pentatonic && pentatonic) dots.push({ layer: 'pentatonic', label: pentatonic, root: pentatonic === '1' });
    if (enabled.arpeggio && arpeggio) dots.push({ layer: 'arpeggio', label: arpeggio, root: arpeggio === '1' });
    if (enabled.scale && scale) dots.push({ layer: 'scale', label: scale, root: scale === '1' });
    return dots;
  };

  return <section className={`ah-fretboard-customizer ${mode === 'roots' ? 'ah-fretboard-roots' : ''}`}>
    <div className="ah-piece-section-head"><div><span className="eyebrow">{eyebrow}</span><h2>{heading}</h2><p>{description}</p></div><div className="ah-fretboard-key"><small>Study key</small><strong>{keyLabel}</strong></div></div>
    {mode === 'layers' && <div className="ah-fretboard-controls"><label className="ah-fretboard-chord"><span>Active chord</span><select value={activeChordLabel} onChange={event => setActiveChordLabel(event.target.value)}>{chords.map(chord => <option key={chord.label} value={chord.label}>{chord.label}</option>)}</select></label><div className="ah-fretboard-layers" aria-label="Fretboard layers">{LAYERS.map(layer => <button type="button" key={layer.id} className={`layer-${layer.id} ${enabled[layer.id] ? 'active' : ''}`} aria-pressed={enabled[layer.id]} onClick={() => setEnabled(previous => ({ ...previous, [layer.id]: !previous[layer.id] }))}><i aria-hidden="true"/><span>{layer.label}</span><small>{layer.id === 'caged' ? cagedLabel : layer.id === 'pentatonic' ? pentatonicLabel : layer.detail}</small></button>)}</div></div>}
    <div className="ah-fretboard-legend">{mode === 'roots' ? <span><b className="root-key">1</b> Every highlighted note is the selected key’s root.</span> : <><span><b className="root-key">1</b> Root notes use black ink on a light marker.</span><span>High <b>e</b> is on top. Low <b>E</b> is on bottom.</span><span>0–15 frets · first repeated position after 12th fret included.</span></>}</div>
    <div className="ah-full-neck-scroll" tabIndex={0} role="region" aria-label="Full fretboard with selectable study layers"><div className="ah-full-neck"><div className="ah-full-neck-frets"><span></span>{frets.map(fret => <span key={fret}>{fret}</span>)}</div>{DISPLAY_STRINGS.map(string => <div className="ah-full-neck-string" key={string.source}><b>{string.label}</b>{frets.map(fret => <span className="ah-full-neck-cell" key={fret}>{dotsFor(string, fret).map((dot, index) => <i key={`${dot.layer}-${index}`} className={`ah-layer-dot ${dot.layer} ${dot.root ? 'root' : ''}`} title={`${dot.layer}: ${dot.label}`}><small>{dot.label}</small></i>)}</span>)}</div>)}</div></div>
  </section>;
}

export const AfterHoursFretboardCustomizer = FretboardMap;
