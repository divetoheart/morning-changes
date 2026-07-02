import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from 'react';
import type { ArpType } from './after-hours-types';
import { PENTATONIC_BOXES } from './after-hours-shapes';
import { assertMusicEngineContract } from './lib/music/contract';
import {
  buildChord,
  createKey,
  DEFAULT_FRET_RANGE,
  displayStringOrder,
  generateCagedMajorCycle,
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
  keyLabel: ReactNode;
  majorRoot: string;
  minorRoot: string;
  chords: ChordOption[];
  description: ReactNode;
  cagedLabel: ReactNode;
  pentatonicLabel: ReactNode;
  defaultLayers?: Partial<Record<Layer, boolean>>;
  mode?: 'layers' | 'roots';
  eyebrow?: string;
  heading?: string;
};

const FRET_NUMBERS = Array.from({ length: DEFAULT_FRET_RANGE.end - DEFAULT_FRET_RANGE.start + 1 }, (_, index) => DEFAULT_FRET_RANGE.start + index);
const DISPLAY_STRINGS = displayStringOrder(STANDARD_TUNING).map(source => ({
  source,
  label: source === STANDARD_TUNING.openStrings.length - 1 ? 'e' : noteToString(STANDARD_TUNING.openStrings[source])
}));
const LAYERS: Array<{ id: Layer; label: string; detail: string }> = [
  { id: 'caged', label: 'CAGED', detail: 'five major chord forms' },
  { id: 'pentatonic', label: 'Pentatonic', detail: 'five connected boxes' },
  { id: 'arpeggio', label: 'Arpeggio', detail: 'active chord tones' },
  { id: 'scale', label: 'Scale', detail: 'active chord scale' }
];
const DEFAULT_LAYERS: Record<Layer, boolean> = { caged: false, pentatonic: true, arpeggio: true, scale: false };
const MARKER_COLORS: Record<string, string> = {
  caged: '#84bdff',
  'caged-c': '#72a7f4',
  'caged-a': '#ea8eb9',
  'caged-g': '#b899eb',
  'caged-e': '#67c7a2',
  'caged-d': '#f0b867',
  pentatonic: '#f7bf65',
  arpeggio: '#e69bc6',
  scale: '#83d5b7',
  roots: '#f5d46b'
};
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
function membershipGroups(entries: readonly LayerMembership[]) {
  const groups = new Map<string, LayerMembership[]>();
  for (const entry of entries) {
    const key = cellKey(entry.stringIndex, entry.fret);
    const existing = groups.get(key) ?? [];
    existing.push(entry);
    groups.set(key, existing);
  }
  return groups;
}
function visibleRoot(cell: LayerCell): boolean {
  return cell.primary.interval === '1';
}
function markerStyle(cell: LayerCell): CSSProperties {
  const colors = cell.segments.map(segment => MARKER_COLORS[segment.colorId ?? segment.layer] ?? '#f5d46b');
  const core = visibleRoot(cell) ? '#f5d46b' : colors[0];
  const stops = colors.map((color, index) => `${color} ${(index / colors.length) * 100}% ${((index + 1) / colors.length) * 100}%`).join(', ');
  return {
    background: colors.length > 1 ? `conic-gradient(${stops})` : core,
    ['--marker-core' as string]: core
  } as CSSProperties;
}
function detailLayerLabel(membership: LayerMembership): string {
  if (membership.layer !== 'caged') return membership.layer[0].toUpperCase() + membership.layer.slice(1);
  return `CAGED ${membership.variant ?? 'form'}`;
}
function markerTitle(cell: LayerCell): string {
  const memberships = cell.memberships.map(item => `${detailLayerLabel(item)}: ${item.interval}`).join(' · ');
  return `${cell.marker === 'conflict' ? 'Focus label shown first. ' : ''}${memberships}`;
}

/**
 * Shared neck renderer. Roots, chord tones, scales, standard-tuning CAGED parent
 * forms, and collision resolution all come from lib/music. Pentatonic remains
 * the final legacy physical template family awaiting the same generator migration.
 */
export function FretboardMap({ keyLabel, majorRoot, minorRoot, chords, description, cagedLabel, pentatonicLabel, defaultLayers, mode = 'layers', eyebrow = 'Shapes and voicings', heading = 'One neck. Every map you need.' }: FretboardMapProps) {
  const [enabled, setEnabled] = useState<Record<Layer, boolean>>({ ...DEFAULT_LAYERS, ...defaultLayers });
  const [activeChordLabel, setActiveChordLabel] = useState(chords[0]?.label ?? 'C');
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);
  const chordSignature = chords.map(chord => chord.label).join('|');
  useEffect(() => { setActiveChordLabel(chords[0]?.label ?? 'C'); setSelectedCellKey(null); }, [chordSignature]);

  const activeChord = chords.find(chord => chord.label === activeChordLabel) ?? chords[0] ?? { label: 'C7' };
  const activeRootLabel = activeChord.root ?? rootForLabel(activeChord.label);
  const activeQuality = activeChord.quality ?? qualityForLabel(activeChord.label);
  const majorRootNote = useMemo(() => parseNote(majorRoot), [majorRoot]);
  const minorRootNote = useMemo(() => parseNote(minorRoot), [minorRoot]);
  const activeRootNote = useMemo(() => parseNote(activeRootLabel), [activeRootLabel]);

  const pentatonicAnchor = (minorRootNote.pitchClass - STANDARD_TUNING.openStrings[0].pitchClass + 12) % 12;
  const cagedGroups = useMemo(() => membershipGroups(generateCagedMajorCycle(majorRootNote).flatMap(shape => shape.positions
    .filter(position => position.fret >= DEFAULT_FRET_RANGE.start && position.fret <= DEFAULT_FRET_RANGE.end)
    .map(position => ({ ...position, layer: 'caged' as const, variant: `${shape.form}-form`, colorId: position.colorId })))), [majorRootNote]);
  const pentatonicSet = useMemo(() => buildPatternSet(PENTATONIC_BOXES, pentatonicAnchor), [pentatonicAnchor]);
  const arpeggioMap = useMemo(() => membershipMap(positionsForChord(buildChord(activeRootNote, ENGINE_CHORD_QUALITY[activeQuality]))), [activeRootNote, activeQuality]);
  const scaleMap = useMemo(() => membershipMap(positionsForScale(createKey(activeRootNote, ENGINE_SCALE_MODE[activeQuality]))), [activeRootNote, activeQuality]);
  const rootMap = useMemo(() => membershipMap(positionsForIntervals(activeRootNote, ['1'], 'root')), [activeRootNote]);

  const cellsByPosition = useMemo(() => {
    const memberships: LayerMembership[] = [];
    for (const string of DISPLAY_STRINGS) for (const fret of FRET_NUMBERS) {
      const key = cellKey(string.source, fret);
      if (mode === 'roots') {
        const root = rootMap.get(key);
        if (root) memberships.push({ ...root, layer: 'roots' });
        continue;
      }
      const caged = cagedGroups.get(key) ?? [];
      const pentatonic = pentatonicSet.get(key);
      const arpeggio = arpeggioMap.get(key);
      const scale = scaleMap.get(key);
      if (enabled.caged) memberships.push(...caged);
      if (enabled.pentatonic && pentatonic) memberships.push({ stringIndex: string.source, fret, interval: pentatonic, role: pentatonic === '1' ? 'root' : 'shapeTone', layer: 'pentatonic' });
      if (enabled.arpeggio && arpeggio) memberships.push({ ...arpeggio, layer: 'arpeggio' });
      if (enabled.scale && scale) memberships.push({ ...scale, layer: 'scale' });
    }
    return new Map(resolveLayerCells(memberships, { focusLayer: 'arpeggio' }).map(cell => [cellKey(cell.stringIndex, cell.fret), cell]));
  }, [arpeggioMap, cagedGroups, enabled, mode, pentatonicSet, rootMap, scaleMap]);

  useEffect(() => {
    if (selectedCellKey && !cellsByPosition.has(selectedCellKey)) setSelectedCellKey(null);
  }, [cellsByPosition, selectedCellKey]);

  const selectedCell = selectedCellKey ? cellsByPosition.get(selectedCellKey) ?? null : null;
  const selectedString = selectedCell ? DISPLAY_STRINGS.find(string => string.source === selectedCell.stringIndex)?.label : '';

  return <section className={`ah-fretboard-customizer ${mode === 'roots' ? 'ah-fretboard-roots' : ''}`}>
    <div className="ah-piece-section-head"><div><span className="eyebrow">{eyebrow}</span><h2>{heading}</h2><p>{description}</p></div><div className="ah-fretboard-key"><small>Study key</small><strong>{keyLabel}</strong></div></div>
    {mode === 'layers' && <div className="ah-fretboard-controls"><label className="ah-fretboard-chord"><span>Active chord</span><select value={activeChordLabel} onChange={event => { setActiveChordLabel(event.target.value); setSelectedCellKey(null); }}>{chords.map(chord => <option key={chord.label} value={chord.label}>{chord.label}</option>)}</select></label><div className="ah-fretboard-layers" aria-label="Fretboard layers">{LAYERS.map(layer => <button type="button" key={layer.id} className={`layer-${layer.id} ${enabled[layer.id] ? 'active' : ''}`} aria-pressed={enabled[layer.id]} onClick={() => { setEnabled(previous => ({ ...previous, [layer.id]: !previous[layer.id] })); setSelectedCellKey(null); }}><i aria-hidden="true"/><span>{layer.label}</span><small>{layer.id === 'caged' ? cagedLabel : layer.id === 'pentatonic' ? pentatonicLabel : layer.detail}</small></button>)}</div></div>}
    <div className="ah-fretboard-legend">{mode === 'roots' ? <span><b className="root-key">1</b> Every highlighted note is the selected key’s root.</span> : <><span><b className="root-key">1</b> Arpeggio controls the visible label when layers disagree.</span><span>CAGED uses distinct C, A, G, E, and D-form colors.</span><span>Tap any marker for its complete role list.</span></>}</div>
    {selectedCell && <aside className="ah-fretboard-detail" aria-live="polite"><div><span className="eyebrow">Fret detail</span><strong>String {selectedString} · fret {selectedCell.fret}</strong><p>{selectedCell.marker === 'conflict' ? 'The arpeggio label is shown because it is the focus layer. Other memberships remain listed here.' : 'This marker represents every active membership at this position.'}</p></div><button type="button" onClick={() => setSelectedCellKey(null)} aria-label="Close fret detail">×</button><ul>{selectedCell.memberships.map(membership => <li key={`${membership.layer}-${membership.variant ?? ''}-${membership.interval}`}><span className={`ah-detail-swatch ${membership.colorId ?? membership.layer}`} aria-hidden="true"/><strong>{detailLayerLabel(membership)}</strong><span>{membership.interval}{membership.role === 'root' ? ' · root' : ''}</span></li>)}</ul></aside>}
    <div className="ah-full-neck-scroll" tabIndex={0} role="region" aria-label="Full fretboard with selectable study layers"><div className="ah-full-neck"><div className="ah-full-neck-frets"><span></span>{FRET_NUMBERS.map(fret => <span key={fret}>{fret}</span>)}</div>{DISPLAY_STRINGS.map(string => <div className="ah-full-neck-string" key={string.source}><b>{string.label}</b>{FRET_NUMBERS.map(fret => { const key = cellKey(string.source, fret); const cell = cellsByPosition.get(key); return <span className="ah-full-neck-cell" key={fret}>{cell && <button type="button" className={`ah-layer-dot ${cell.primary.layer} ${visibleRoot(cell) ? 'root' : ''} ${cell.marker} ${cell.segments.length > 1 ? 'multi' : ''}`} style={markerStyle(cell)} title={markerTitle(cell)} aria-label={`${selectedCellKey === key ? 'Selected. ' : ''}${markerTitle(cell)}`} aria-pressed={selectedCellKey === key} onClick={() => setSelectedCellKey(key)}><small>{cell.primary.interval}</small></button>}</span>; })}</div>)}</div></div>
  </section>;
}

export const AfterHoursFretboardCustomizer = FretboardMap;
