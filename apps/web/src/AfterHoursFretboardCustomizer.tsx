import { type CSSProperties, useEffect, useMemo, useState } from 'react';
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
  resolveLayerCells,
  STANDARD_TUNING,
  type ChordQuality,
  type IntervalName,
  type LayerCell,
  type LayerMembership,
  type ScaleMode
} from './lib/music';

if (import.meta.env.DEV) assertMusicEngineContract();

type Layer = 'caged' | 'pentatonic' | 'arpeggio' | 'scale';
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
const MARKER_COLORS: Record<Layer, string> = { caged: '#84bdff', pentatonic: '#f7bf65', arpeggio: '#e69bc6', scale: '#83d5b7' };
const ENGINE_CHORD_QUALITY: Record<ArpType, ChordQuality> = { maj7: 'major7', m7: 'minor7', '7': 'dominant7', m7b5: 'halfDiminished7' };
const ENGINE_SCALE_MODE: Record<ArpType, ScaleMode> = { maj7: 'major', m7: 'dorian', '7': 'mixolydian', m7b5: 'locrian' };

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
  const set = new Map<string, IntervalName>();
  for (const shift of [-24, -12, 0, 12, 24]) {
    for (const pattern of patterns) for (const [source, offset, label] of pattern) {
      const fret = anchor + offset + shift;
      if (fret >= DEFAULT_FRET_RANGE.start && fret <= DEFAULT_FRET_RANGE.end) set.set(cellKey(source, fret), label as IntervalName);
    }
  }
  return set;
}
function membershipMap(entries: Array<{ stringIndex: number; fret: number; interval: IntervalName; role: LayerMembership['role'] }>) {
  return new Map(entries.map(entry => [cellKey(entry.stringIndex, entry.fret), entry]));
}
function markerStyle(cell: LayerCell): CSSProperties {
  const colors = cell.segments.map(layer => MARKER_COLORS[layer as Layer] ?? '#f5d46b');
  const core = cell.root ? '#f5d46b' : colors[0];
  const stops = colors.map((color, index) => `${color} ${(index / colors.length) * 100}% ${((index + 1) / colors.length) * 100}%`).join(', ');
  return {
    background: colors.length > 1 ? `conic-gradient(${stops})` : core,
    ['--marker-core' as string]: core
  } as CSSProperties;
}
function markerTitle(cell: LayerCell): string {
  const memberships = cell.memberships.map(item => `${item.layer}: ${item.interval}`).join(' · ');
  return `${cell.marker === 'conflict' ? 'Focus label shown first. ' : ''}${memberships}`;
}

/**
 * Shared neck renderer. Chord tones, scales, roots, tuning, display-string order,
 * and one-label layer collision resolution come from lib/music. Legacy physical
 * CAGED/pentatonic templates remain isolated until validation/migration is done.
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
  const arpeggioMap = useMemo(() => membershipMap(positionsForChord(buildChord(activeRootNote, ENGINE_CHORD_QUALITY[activeQuality]))), [activeRootNote, activeQuality]);
  const scaleMap = useMemo(() => membershipMap(positionsForScale(createKey(activeRootNote, ENGINE_SCALE_MODE[activeQuality]))), [activeRootNote, activeQuality]);
  const rootMap = useMemo(() => membershipMap(positionsForIntervals(activeRootNote, ['1'], 'root')), [activeRootNote]);
  const frets = Array.from({ length: FRET_COUNT }, (_, index) => DEFAULT_FRET_RANGE.start + index);

  const cellsByPosition = useMemo(() => {
    const memberships: LayerMembership[] = [];
    for (const string of DISPLAY_STRINGS) for (const fret of frets) {
      const key = cellKey(string.source, fret);
      if (mode === 'roots') {
        const root = rootMap.get(key);
        if (root) memberships.push({ ...root, layer: 'roots' });
        continue;
      }
      const caged = cagedSet.get(key);
      const pentatonic = pentatonicSet.get(key);
      const arpeggio = arpeggioMap.get(key);
      const scale = scaleMap.get(key);
      if (enabled.caged && caged) memberships.push({ stringIndex: string.source, fret, interval: caged, role: caged === '1' ? 'root' : 'shapeTone', layer: 'caged' });
      if (enabled.pentatonic && pentatonic) memberships.push({ stringIndex: string.source, fret, interval: pentatonic, role: pentatonic === '1' ? 'root' : 'shapeTone', layer: 'pentatonic' });
      if (enabled.arpeggio && arpeggio) memberships.push({ ...arpeggio, layer: 'arpeggio' });
      if (enabled.scale && scale) memberships.push({ ...scale, layer: 'scale' });
    }
    return new Map(resolveLayerCells(memberships, { focusLayer: 'arpeggio' }).map(cell => [cellKey(cell.stringIndex, cell.fret), cell]));
  }, [arpeggioMap, cagedSet, enabled, frets, mode, pentatonicSet, rootMap, scaleMap]);

  return <section className={`ah-fretboard-customizer ${mode === 'roots' ? 'ah-fretboard-roots' : ''}`}>
    <div className="ah-piece-section-head"><div><span className="eyebrow">{eyebrow}</span><h2>{heading}</h2><p>{description}</p></div><div className="ah-fretboard-key"><small>Study key</small><strong>{keyLabel}</strong></div></div>
    {mode === 'layers' && <div className="ah-fretboard-controls"><label className="ah-fretboard-chord"><span>Active chord</span><select value={activeChordLabel} onChange={event => setActiveChordLabel(event.target.value)}>{chords.map(chord => <option key={chord.label} value={chord.label}>{chord.label}</option>)}</select></label><div className="ah-fretboard-layers" aria-label="Fretboard layers">{LAYERS.map(layer => <button type="button" key={layer.id} className={`layer-${layer.id} ${enabled[layer.id] ? 'active' : ''}`} aria-pressed={enabled[layer.id]} onClick={() => setEnabled(previous => ({ ...previous, [layer.id]: !previous[layer.id] }))}><i aria-hidden="true"/><span>{layer.label}</span><small>{layer.id === 'caged' ? cagedLabel : layer.id === 'pentatonic' ? pentatonicLabel : layer.detail}</small></button>)}</div></div>}
    <div className="ah-fretboard-legend">{mode === 'roots' ? <span><b className="root-key">1</b> Every highlighted note is the selected key’s root.</span> : <><span><b className="root-key">1</b> Arpeggio controls the visible label when layers disagree.</span><span>Layer rings show other active memberships.</span><span>High <b>e</b> is on top. Low <b>E</b> is on bottom.</span></>}</div>
    <div className="ah-full-neck-scroll" tabIndex={0} role="region" aria-label="Full fretboard with selectable study layers"><div className="ah-full-neck"><div className="ah-full-neck-frets"><span></span>{frets.map(fret => <span key={fret}>{fret}</span>)}</div>{DISPLAY_STRINGS.map(string => <div className="ah-full-neck-string" key={string.source}><b>{string.label}</b>{frets.map(fret => { const cell = cellsByPosition.get(cellKey(string.source, fret)); return <span className="ah-full-neck-cell" key={fret}>{cell && <i className={`ah-layer-dot ${cell.primary.layer} ${cell.root ? 'root' : ''} ${cell.marker} ${cell.segments.length > 1 ? 'multi' : ''}`} style={markerStyle(cell)} title={markerTitle(cell)} aria-label={markerTitle(cell)}><small>{cell.primary.interval}</small></i>}</span>; })}</div>)}</div></div>
  </section>;
}

export const AfterHoursFretboardCustomizer = FretboardMap;
