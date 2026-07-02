import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from 'react';
import { assertMusicEngineContract } from './lib/music/contract';
import {
  chordSymbol,
  createKey,
  DEFAULT_FRET_RANGE,
  displayStringOrder,
  generateCagedMajorCycle,
  generateMinorPentatonicCycle,
  noteToString,
  parseNote,
  positionsForChord,
  positionsForIntervals,
  positionsForScale,
  resolveLayerCells,
  STANDARD_TUNING,
  type Chord,
  type ChordQuality,
  type IntervalName,
  type LayerCell,
  type LayerMembership,
  type ScaleMode
} from './lib/music';

if (import.meta.env.DEV) assertMusicEngineContract();

type Layer = 'caged' | 'pentatonic' | 'arpeggio' | 'scale';
export type FretboardChordOption = { chord: Chord; scaleMode?: ScaleMode };

type FretboardMapProps = {
  keyLabel: ReactNode;
  majorRoot: string;
  minorRoot: string;
  chords: readonly FretboardChordOption[];
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
  caged: '#84bdff', 'caged-c': '#72a7f4', 'caged-a': '#ea8eb9', 'caged-g': '#b899eb', 'caged-e': '#67c7a2', 'caged-d': '#f0b867',
  pentatonic: '#f7bf65', 'pentatonic-1': '#f7bf65', 'pentatonic-2': '#efac62', 'pentatonic-3': '#e99b79', 'pentatonic-4': '#d993a3', 'pentatonic-5': '#bda3da',
  arpeggio: '#e69bc6', scale: '#83d5b7', roots: '#f5d46b'
};

function defaultScaleMode(quality: ChordQuality): ScaleMode {
  if (quality === 'major' || quality === 'major7' || quality === 'sus2' || quality === 'sus4') return 'major';
  if (quality === 'minor') return 'naturalMinor';
  if (quality === 'minor7') return 'dorian';
  if (quality === 'dominant7') return 'mixolydian';
  if (quality === 'halfDiminished7' || quality === 'diminished' || quality === 'diminished7') return 'locrian';
  return 'lydian';
}
function cellKey(source: number, fret: number) { return `${source}:${fret}`; }
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
function visibleRoot(cell: LayerCell): boolean { return cell.primary.interval === '1'; }
function markerStyle(cell: LayerCell): CSSProperties {
  const colors = cell.segments.map(segment => MARKER_COLORS[segment.colorId ?? segment.layer] ?? '#f5d46b');
  const core = visibleRoot(cell) ? '#f5d46b' : colors[0];
  const stops = colors.map((color, index) => `${color} ${(index / colors.length) * 100}% ${((index + 1) / colors.length) * 100}%`).join(', ');
  return { background: colors.length > 1 ? `conic-gradient(${stops})` : core, ['--marker-core' as string]: core } as CSSProperties;
}
function detailLayerLabel(membership: LayerMembership): string {
  if (membership.layer === 'caged') return `CAGED ${membership.variant ?? 'form'}`;
  if (membership.layer === 'pentatonic') return `Pentatonic ${membership.variant ?? 'box'}`;
  return membership.layer[0].toUpperCase() + membership.layer.slice(1);
}
function markerTitle(cell: LayerCell): string {
  const memberships = cell.memberships.map(item => `${detailLayerLabel(item)}: ${item.interval}`).join(' · ');
  return `${cell.marker === 'conflict' ? 'Focus label shown first. ' : ''}${memberships}`;
}

/** Shared full-neck renderer. All active chord maps are typed Chord data. */
export function FretboardMap({ keyLabel, majorRoot, minorRoot, chords, description, cagedLabel, pentatonicLabel, defaultLayers, mode = 'layers', eyebrow = 'Shapes and voicings', heading = 'One neck. Every map you need.' }: FretboardMapProps) {
  const [enabled, setEnabled] = useState<Record<Layer, boolean>>({ ...DEFAULT_LAYERS, ...defaultLayers });
  const [activeChordKey, setActiveChordKey] = useState(() => chords[0] ? chordSymbol(chords[0].chord) : 'C');
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);
  const chordSignature = chords.map(option => chordSymbol(option.chord)).join('|');
  useEffect(() => { setActiveChordKey(chords[0] ? chordSymbol(chords[0].chord) : 'C'); setSelectedCellKey(null); }, [chordSignature, chords]);

  const activeOption = chords.find(option => chordSymbol(option.chord) === activeChordKey) ?? chords[0];
  const activeChord = activeOption?.chord;
  const majorRootNote = useMemo(() => parseNote(majorRoot), [majorRoot]);
  const minorRootNote = useMemo(() => parseNote(minorRoot), [minorRoot]);

  const cagedGroups = useMemo(() => membershipGroups(generateCagedMajorCycle(majorRootNote).flatMap(shape => shape.positions
    .filter(position => position.fret >= DEFAULT_FRET_RANGE.start && position.fret <= DEFAULT_FRET_RANGE.end)
    .map(position => ({ ...position, layer: 'caged' as const, variant: `${shape.form}-form`, colorId: position.colorId })))), [majorRootNote]);
  const pentatonicGroups = useMemo(() => membershipGroups(generateMinorPentatonicCycle(minorRootNote, STANDARD_TUNING, DEFAULT_FRET_RANGE).flatMap(shape => shape.positions
    .map(position => ({ ...position, layer: 'pentatonic' as const, variant: `Box ${shape.box}`, colorId: position.colorId })))), [minorRootNote]);
  const arpeggioMap = useMemo(() => activeChord ? membershipMap(positionsForChord(activeChord)) : new Map(), [activeChord]);
  const scaleMap = useMemo(() => activeChord ? membershipMap(positionsForScale(createKey(activeChord.root, activeOption?.scaleMode ?? defaultScaleMode(activeChord.quality)))) : new Map(), [activeChord, activeOption?.scaleMode]);
  const rootMap = useMemo(() => activeChord ? membershipMap(positionsForIntervals(activeChord.root, ['1'], 'root')) : new Map(), [activeChord]);

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
      const pentatonic = pentatonicGroups.get(key) ?? [];
      const arpeggio = arpeggioMap.get(key);
      const scale = scaleMap.get(key);
      if (enabled.caged) memberships.push(...caged);
      if (enabled.pentatonic) memberships.push(...pentatonic);
      if (enabled.arpeggio && arpeggio) memberships.push({ ...arpeggio, layer: 'arpeggio' });
      if (enabled.scale && scale) memberships.push({ ...scale, layer: 'scale' });
    }
    return new Map(resolveLayerCells(memberships, { focusLayer: 'arpeggio' }).map(cell => [cellKey(cell.stringIndex, cell.fret), cell]));
  }, [arpeggioMap, cagedGroups, enabled, mode, pentatonicGroups, rootMap, scaleMap]);

  useEffect(() => { if (selectedCellKey && !cellsByPosition.has(selectedCellKey)) setSelectedCellKey(null); }, [cellsByPosition, selectedCellKey]);
  const selectedCell = selectedCellKey ? cellsByPosition.get(selectedCellKey) ?? null : null;
  const selectedString = selectedCell ? DISPLAY_STRINGS.find(string => string.source === selectedCell.stringIndex)?.label : '';

  return <section className={`ah-fretboard-customizer ${mode === 'roots' ? 'ah-fretboard-roots' : ''}`}>
    <div className="ah-piece-section-head"><div><span className="eyebrow">{eyebrow}</span><h2>{heading}</h2><p>{description}</p></div><div className="ah-fretboard-key"><small>Study key</small><strong>{keyLabel}</strong></div></div>
    {mode === 'layers' && <div className="ah-fretboard-controls"><label className="ah-fretboard-chord"><span>Active chord</span><select value={activeChordKey} onChange={event => { setActiveChordKey(event.target.value); setSelectedCellKey(null); }}>{chords.map(option => { const symbol = chordSymbol(option.chord); return <option key={symbol} value={symbol}>{symbol}</option>; })}</select></label><div className="ah-fretboard-layers" aria-label="Fretboard layers">{LAYERS.map(layer => <button type="button" key={layer.id} className={`layer-${layer.id} ${enabled[layer.id] ? 'active' : ''}`} aria-pressed={enabled[layer.id]} onClick={() => { setEnabled(previous => ({ ...previous, [layer.id]: !previous[layer.id] })); setSelectedCellKey(null); }}><i aria-hidden="true"/><span>{layer.label}</span><small>{layer.id === 'caged' ? cagedLabel : layer.id === 'pentatonic' ? pentatonicLabel : layer.detail}</small></button>)}</div></div>}
    <div className="ah-fretboard-legend">{mode === 'roots' ? <span><b className="root-key">1</b> Every highlighted note is the selected key’s root.</span> : <><span><b className="root-key">1</b> Arpeggio controls the visible label when layers disagree.</span><span>CAGED forms and Pentatonic boxes retain their own colors.</span><span>Tap any marker for its complete role list.</span></>}</div>
    {selectedCell && <aside className="ah-fretboard-detail" aria-live="polite"><div><span className="eyebrow">Fret detail</span><strong>String {selectedString} · fret {selectedCell.fret}</strong><p>{selectedCell.marker === 'conflict' ? 'The arpeggio label is shown because it is the focus layer. Other memberships remain listed here.' : 'This marker represents every active membership at this position.'}</p></div><button type="button" onClick={() => setSelectedCellKey(null)} aria-label="Close fret detail">×</button><ul>{selectedCell.memberships.map(membership => <li key={`${membership.layer}-${membership.variant ?? ''}-${membership.interval}`}><span className={`ah-detail-swatch ${membership.colorId ?? membership.layer}`} aria-hidden="true"/><strong>{detailLayerLabel(membership)}</strong><span>{membership.interval}{membership.role === 'root' ? ' · root' : ''}</span></li>)}</ul></aside>}
    <div className="ah-full-neck-scroll" tabIndex={0} role="region" aria-label="Full fretboard with selectable study layers"><div className="ah-full-neck"><div className="ah-full-neck-frets"><span></span>{FRET_NUMBERS.map(fret => <span key={fret}>{fret}</span>)}</div>{DISPLAY_STRINGS.map(string => <div className="ah-full-neck-string" key={string.source}><b>{string.label}</b>{FRET_NUMBERS.map(fret => { const key = cellKey(string.source, fret); const cell = cellsByPosition.get(key); return <span className="ah-full-neck-cell" key={fret}>{cell && <button type="button" className={`ah-layer-dot ${cell.primary.layer} ${visibleRoot(cell) ? 'root' : ''} ${cell.marker} ${cell.segments.length > 1 ? 'multi' : ''}`} style={markerStyle(cell)} title={markerTitle(cell)} aria-label={`${selectedCellKey === key ? 'Selected. ' : ''}${markerTitle(cell)}`} aria-pressed={selectedCellKey === key} onClick={() => setSelectedCellKey(key)}><small>{cell.primary.interval}</small></button>}</span>; })}</div>)}</div></div>
  </section>;
}

export const AfterHoursFretboardCustomizer = FretboardMap;