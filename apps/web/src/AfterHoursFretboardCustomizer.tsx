import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from 'react';
import { assertMusicEngineContract } from './lib/music/contract';
import {
  chordSymbol,
  createKey,
  DEFAULT_FRET_RANGE,
  displayStringOrder,
  findGuitarTriadVoicings,
  generateCagedMajorCycle,
  generateMinorPentatonicCycle,
  generateVoicing,
  noteToString,
  parseNote,
  positionsForChord,
  positionsForIntervals,
  positionsForScale,
  resolveLayerCells,
  selectGuitarVoicingCandidate,
  STANDARD_TUNING,
  triadForChord,
  type Chord,
  type ChordQuality,
  type FretboardLayerId,
  type FretRange,
  type LayerCell,
  type LayerMembership,
  type ScaleMode,
  type TriadInversion,
  type VoicingRecipe
} from './lib/music';

if (import.meta.env.DEV) assertMusicEngineContract();

type Layer = 'caged' | 'pentatonic' | 'triad' | 'arpeggio' | 'scale';
type VoicingMode = 'off' | 'shell' | 'drop2';
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
  fretRange?: FretRange;
  compact?: boolean;
  expandHref?: string;
  /** Hide the authored active-chord selector when a parent owns a custom builder. */
  showChordSelector?: boolean;
  /** Optional interactive controls that belong to the visible Study Key card. */
  studyKeyControls?: ReactNode;
  /** Optional app-specific material placed below the map heading and above map controls. */
  beforeControls?: ReactNode;
};

const DISPLAY_STRINGS = displayStringOrder(STANDARD_TUNING).map(source => ({ source, label: source === STANDARD_TUNING.openStrings.length - 1 ? 'e' : noteToString(STANDARD_TUNING.openStrings[source]) }));
const LAYERS: Array<{ id: Layer; label: string; detail: string }> = [
  { id: 'caged', label: 'CAGED', detail: 'five major chord forms' },
  { id: 'pentatonic', label: 'Pentatonic', detail: 'five connected boxes' },
  { id: 'triad', label: 'Triads', detail: 'closed three-note shapes' },
  { id: 'arpeggio', label: 'Arpeggio', detail: 'active chord tones' },
  { id: 'scale', label: 'Scale', detail: 'active chord scale' }
];
const DEFAULT_LAYERS: Record<Layer, boolean> = { caged: false, pentatonic: true, triad: false, arpeggio: true, scale: false };
const TRIAD_INVERSION_LABELS: Record<TriadInversion, string> = { 0: 'Root position', 1: '1st inversion', 2: '2nd inversion' };
const VOICING_LABELS: Record<Exclude<VoicingMode, 'off'>, string> = { shell: 'Shell', drop2: 'Drop 2' };
const MARKER_COLORS: Record<string, string> = {
  caged: '#84bdff', 'caged-c': '#72a7f4', 'caged-a': '#ea8eb9', 'caged-g': '#b899eb', 'caged-e': '#67c7a2', 'caged-d': '#f0b867',
  pentatonic: '#f7bf65', 'pentatonic-1': '#f7bf65', 'pentatonic-2': '#efac62', 'pentatonic-3': '#e99b79', 'pentatonic-4': '#d993a3', 'pentatonic-5': '#bda3da',
  triad: '#8ec9ef', voicing: '#9eb8ff', arpeggio: '#e69bc6', scale: '#83d5b7', roots: '#f5d46b'
};

function defaultScaleMode(quality: ChordQuality): ScaleMode {
  if (quality === 'major' || quality === 'major7' || quality === 'sus2' || quality === 'sus4') return 'major';
  if (quality === 'minor') return 'naturalMinor';
  if (quality === 'minor7') return 'dorian';
  if (quality === 'dominant7') return 'mixolydian';
  if (quality === 'halfDiminished7' || quality === 'diminished' || quality === 'diminished7') return 'locrian';
  return 'lydian';
}

function normalizeFretRange(value?: FretRange): FretRange {
  const start = Math.max(0, Math.floor(value?.start ?? DEFAULT_FRET_RANGE.start));
  const end = Math.max(start, Math.floor(value?.end ?? DEFAULT_FRET_RANGE.end));
  return { start, end };
}

function voicingRecipe(mode: Exclude<VoicingMode, 'off'>): VoicingRecipe {
  return mode === 'shell' ? { kind: 'shell', includeRoot: true, guideToneOrder: '3-7' } : { kind: 'drop2', inversion: 0 };
}

function cellKey(source: number, fret: number) { return `${source}:${fret}`; }
function membershipIdentity(membership: LayerMembership) { return `${membership.layer}:${membership.variant ?? ''}`; }
function membershipMap(entries: Array<Pick<LayerMembership, 'stringIndex' | 'fret' | 'interval' | 'note' | 'role'>>) { return new Map(entries.map(entry => [cellKey(entry.stringIndex, entry.fret), entry])); }
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
function stringSetLabel(stringSet: readonly number[]) { return stringSet.map(source => DISPLAY_STRINGS.find(string => string.source === source)?.label ?? '?').join('-'); }
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
  if (membership.layer === 'triad') return `Triad ${membership.variant ?? 'shape'}`;
  if (membership.layer === 'voicing') return `Voicing ${membership.variant ?? 'shape'}`;
  return membership.layer[0].toUpperCase() + membership.layer.slice(1);
}
function markerTitle(cell: LayerCell): string { return `${cell.marker === 'conflict' ? 'Focus label shown first. ' : ''}${cell.memberships.map(item => `${detailLayerLabel(item)}: ${item.interval}`).join(' · ')}`; }
function stringLabel(source: number) { return DISPLAY_STRINGS.find(string => string.source === source)?.label ?? '?'; }
function detailMembership(cell: LayerCell) { return cell.memberships.find(membership => membership.layer === 'pentatonic') ?? cell.primary; }
function englishDetail(cell: LayerCell, membership: LayerMembership, rootAnchors: ReadonlyMap<string, readonly LayerMembership[]>) {
  const note = noteToString(membership.note);
  const current = `This is ${detailLayerLabel(membership)}: ${membership.interval} (${note}) at fret ${cell.fret} on the ${stringLabel(cell.stringIndex)} string.`;
  const roots = rootAnchors.get(membershipIdentity(membership)) ?? [];
  const nearestRoot = [...roots].sort((left, right) => {
    const leftDistance = Math.abs(left.fret - cell.fret) + Math.abs(left.stringIndex - cell.stringIndex);
    const rightDistance = Math.abs(right.fret - cell.fret) + Math.abs(right.stringIndex - cell.stringIndex);
    return leftDistance - rightDistance || left.fret - right.fret;
  })[0];
  if (!nearestRoot) return current;
  const rootNote = noteToString(nearestRoot.note);
  if (nearestRoot.stringIndex === cell.stringIndex && nearestRoot.fret === cell.fret) return `${current} It is the root of that shape.`;
  return `${current} Its nearest root is on fret ${nearestRoot.fret} of the ${stringLabel(nearestRoot.stringIndex)} string (${rootNote}).`;
}

/** Shared renderer for both full-neck exploration and focused lesson-position studies. */
export function FretboardMap({ keyLabel, majorRoot, minorRoot, chords, description, cagedLabel, pentatonicLabel, defaultLayers, mode = 'layers', eyebrow = 'Shapes and voicings', heading = 'One neck. Every map you need.', fretRange, compact = false, expandHref, showChordSelector = true, studyKeyControls, beforeControls }: FretboardMapProps) {
  const activeRange = useMemo(() => normalizeFretRange(fretRange), [fretRange?.start, fretRange?.end]);
  const fretNumbers = useMemo(() => Array.from({ length: activeRange.end - activeRange.start + 1 }, (_, index) => activeRange.start + index), [activeRange]);
  const [enabled, setEnabled] = useState<Record<Layer, boolean>>({ ...DEFAULT_LAYERS, ...defaultLayers });
  const [triadInversion, setTriadInversion] = useState<TriadInversion>(0);
  const [voicingMode, setVoicingMode] = useState<VoicingMode>('off');
  const chordSignature = chords.map(option => chordSymbol(option.chord)).join('|');
  const [activeChordKey, setActiveChordKey] = useState(() => chordSignature.split('|')[0] ?? 'C');
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);
  useEffect(() => { setActiveChordKey(chordSignature.split('|')[0] ?? 'C'); setSelectedCellKey(null); }, [chordSignature]);

  const activeOption = chords.find(option => chordSymbol(option.chord) === activeChordKey) ?? chords[0];
  const activeChord = activeOption?.chord;
  const activeTriad = useMemo(() => activeChord ? triadForChord(activeChord) : undefined, [activeChord]);
  const activeVoicing = useMemo(() => {
    if (!activeChord || voicingMode === 'off') return undefined;
    try { return generateVoicing(activeChord, voicingRecipe(voicingMode)); } catch { return undefined; }
  }, [activeChord, voicingMode]);
  const majorRootNote = useMemo(() => parseNote(majorRoot), [majorRoot]);
  const minorRootNote = useMemo(() => parseNote(minorRoot), [minorRoot]);
  const cagedGroups = useMemo(() => membershipGroups(generateCagedMajorCycle(majorRootNote).flatMap(shape => shape.positions.filter(position => position.fret >= activeRange.start && position.fret <= activeRange.end).map(position => ({ ...position, layer: 'caged' as const, variant: `${shape.form}-form`, colorId: position.colorId })))), [activeRange.end, activeRange.start, majorRootNote]);
  const pentatonicGroups = useMemo(() => membershipGroups(generateMinorPentatonicCycle(minorRootNote, STANDARD_TUNING, activeRange).flatMap(shape => shape.positions.map(position => ({ ...position, layer: 'pentatonic' as const, variant: `Box ${shape.box}`, colorId: position.colorId })))), [activeRange, minorRootNote]);
  const triadGroups = useMemo(() => activeTriad ? membershipGroups(findGuitarTriadVoicings(activeTriad, triadInversion, { fretRange: activeRange, maxFretSpan: 4, maxResults: 12 }).flatMap(candidate => candidate.positions.map(position => ({ ...position, layer: 'triad' as const, variant: `${TRIAD_INVERSION_LABELS[triadInversion]} · ${stringSetLabel(candidate.stringSet)}`, colorId: 'triad' })))) : new Map<string, LayerMembership[]>(), [activeRange, activeTriad, triadInversion]);
  const voicingGroups = useMemo(() => {
    if (!activeVoicing || voicingMode === 'off') return new Map<string, LayerMembership[]>();
    const candidate = selectGuitarVoicingCandidate(activeVoicing, {
      stringSets: voicingMode === 'shell' ? [[1, 2, 3], [2, 3, 4], [3, 4, 5]] : [[1, 2, 3, 4], [2, 3, 4, 5]],
      fretRange: activeRange,
      maxFretSpan: 5,
      preferredFret: (activeRange.start + activeRange.end) / 2
    });
    return membershipGroups((candidate?.positions ?? []).map(position => ({ ...position, layer: 'voicing' as const, variant: `${VOICING_LABELS[voicingMode]} · ${stringSetLabel(candidate?.stringSet ?? [])}`, colorId: 'voicing' })));
  }, [activeRange, activeVoicing, voicingMode]);
  const arpeggioMap = useMemo(() => activeChord ? membershipMap(positionsForChord(activeChord)) : new Map(), [activeChord]);
  const scaleMap = useMemo(() => activeChord ? membershipMap(positionsForScale(createKey(activeChord.root, activeOption?.scaleMode ?? defaultScaleMode(activeChord.quality)))) : new Map(), [activeChord, activeOption?.scaleMode]);
  const rootMap = useMemo(() => activeChord ? membershipMap(positionsForIntervals(activeChord.root, ['1'], 'root')) : new Map(), [activeChord]);
  const focusLayer: FretboardLayerId = voicingMode !== 'off' && voicingGroups.size > 0 ? 'voicing' : enabled.triad && activeTriad ? 'triad' : 'arpeggio';
  const focusLabel = focusLayer === 'voicing' && voicingMode !== 'off' ? VOICING_LABELS[voicingMode] : focusLayer === 'triad' ? 'Triad' : 'Arpeggio';
  const fretboardData = useMemo(() => {
    const memberships: LayerMembership[] = [];
    for (const string of DISPLAY_STRINGS) for (const fret of fretNumbers) {
      const key = cellKey(string.source, fret);
      if (mode === 'roots') { const root = rootMap.get(key); if (root) memberships.push({ ...root, layer: 'roots' }); continue; }
      const caged = cagedGroups.get(key) ?? [];
      const pentatonic = pentatonicGroups.get(key) ?? [];
      const triads = triadGroups.get(key) ?? [];
      const voicings = voicingGroups.get(key) ?? [];
      const arpeggio = arpeggioMap.get(key);
      const scale = scaleMap.get(key);
      if (enabled.caged) memberships.push(...caged);
      if (enabled.pentatonic) memberships.push(...pentatonic);
      if (enabled.triad) memberships.push(...triads);
      memberships.push(...voicings);
      if (enabled.arpeggio && arpeggio) memberships.push({ ...arpeggio, layer: 'arpeggio' });
      if (enabled.scale && scale) memberships.push({ ...scale, layer: 'scale' });
    }
    const rootAnchors = new Map<string, LayerMembership[]>();
    for (const membership of memberships) {
      if (membership.interval !== '1') continue;
      const identity = membershipIdentity(membership);
      const roots = rootAnchors.get(identity) ?? [];
      roots.push(membership);
      rootAnchors.set(identity, roots);
    }
    return { cells: new Map(resolveLayerCells(memberships, { focusLayer }).map(cell => [cellKey(cell.stringIndex, cell.fret), cell])), rootAnchors };
  }, [arpeggioMap, cagedGroups, enabled, focusLayer, fretNumbers, mode, pentatonicGroups, rootMap, scaleMap, triadGroups, voicingGroups]);
  const cellsByPosition = fretboardData.cells;
  useEffect(() => { if (selectedCellKey && !cellsByPosition.has(selectedCellKey)) setSelectedCellKey(null); }, [cellsByPosition, selectedCellKey]);

  const selectedCell = selectedCellKey ? cellsByPosition.get(selectedCellKey) ?? null : null;
  const selectedString = selectedCell ? stringLabel(selectedCell.stringIndex) : '';
  const selectedMembership = selectedCell ? detailMembership(selectedCell) : null;
  const neckStyle = { ['--fret-count' as string]: String(fretNumbers.length) } as CSSProperties;

  return <section className={`ah-fretboard-customizer ${compact ? 'ah-fretboard-focus' : ''} ${mode === 'roots' ? 'ah-fretboard-roots' : ''}`}>
    <div className="ah-piece-section-head"><div><span className="eyebrow">{eyebrow}</span><h2>{heading}</h2><p>{description}</p></div><div className="ah-fretboard-meta"><div className={`ah-fretboard-key ${studyKeyControls ? 'ah-fretboard-key-interactive' : ''}`}><small>Study key</small><strong>{keyLabel}</strong>{studyKeyControls && <div className="ah-fretboard-key-controls">{studyKeyControls}</div>}</div>{expandHref && <a className="ah-fretboard-expand" href={expandHref} aria-label="Open this study on the full Fretboard">Open full neck <span aria-hidden="true">↗</span></a>}</div></div>
    {beforeControls}
    {mode === 'layers' && <div className="ah-fretboard-controls">{showChordSelector && <label className="ah-fretboard-chord"><span>Active chord</span><select value={activeChordKey} onChange={event => { setActiveChordKey(event.target.value); setSelectedCellKey(null); }}>{chords.map(option => { const symbol = chordSymbol(option.chord); return <option key={symbol} value={symbol}>{symbol}</option>; })}</select></label>}{activeTriad && <label className="ah-fretboard-chord"><span>Triad inversion</span><select value={triadInversion} onChange={event => { setTriadInversion(Number(event.target.value) as TriadInversion); setSelectedCellKey(null); }}><option value={0}>Root position</option><option value={1}>1st inversion</option><option value={2}>2nd inversion</option></select></label>}<label className="ah-fretboard-chord"><span>Chord voicing</span><select value={voicingMode} onChange={event => { setVoicingMode(event.target.value as VoicingMode); setSelectedCellKey(null); }}><option value="off">Off</option><option value="shell">Shell</option><option value="drop2">Drop 2</option></select></label><div className="ah-fretboard-layers" aria-label="Fretboard layers">{LAYERS.map(layer => { const unavailable = layer.id === 'triad' && !activeTriad; return <button type="button" key={layer.id} className={`layer-${layer.id} ${enabled[layer.id] ? 'active' : ''}`} aria-pressed={enabled[layer.id]} disabled={unavailable} onClick={() => { setEnabled(previous => ({ ...previous, [layer.id]: !previous[layer.id] })); setSelectedCellKey(null); }}><i aria-hidden="true"/><span>{layer.label}</span><small>{layer.id === 'caged' ? cagedLabel : layer.id === 'pentatonic' ? pentatonicLabel : layer.detail}</small></button>; })}</div></div>}
    <div className="ah-fretboard-legend">{mode === 'roots' ? <span><b className="root-key">1</b> Every highlighted note is the selected key’s root.</span> : <><span><b className="root-key">1</b> {focusLabel} controls the visible label when layers disagree.</span>{compact && <span>Focused range · frets {activeRange.start}–{activeRange.end}</span>}<span>Tap any marker to see what it means in plain English.</span></>}</div>
    {selectedCell && selectedMembership && <aside className="ah-fretboard-detail" aria-live="polite"><div><span className="eyebrow">Fret detail</span><strong>Fret {selectedCell.fret} · {selectedString} string</strong><p>{englishDetail(selectedCell, selectedMembership, fretboardData.rootAnchors)}</p></div><button type="button" onClick={() => setSelectedCellKey(null)} aria-label="Close fret detail">×</button><ul>{selectedCell.memberships.map(membership => <li key={`${membership.layer}-${membership.variant ?? ''}-${membership.interval}`}><span className={`ah-detail-swatch ${membership.colorId ?? membership.layer}`} aria-hidden="true"/><strong>{detailLayerLabel(membership)}</strong><span>{membership.interval} · {noteToString(membership.note)}{membership.role === 'root' ? ' · root' : ''}</span></li>)}</ul></aside>}
    <div className="ah-full-neck-scroll" tabIndex={0} role="region" aria-label={`${compact ? `Focused fretboard from fret ${activeRange.start} to ${activeRange.end}` : 'Full fretboard'} with selectable study layers`}><div className="ah-full-neck" style={neckStyle}><div className="ah-full-neck-frets"><span></span>{fretNumbers.map(fret => <span key={fret}>{fret}</span>)}</div>{DISPLAY_STRINGS.map(string => <div className="ah-full-neck-string" key={string.source}><b>{string.label}</b>{fretNumbers.map(fret => { const key = cellKey(string.source, fret); const cell = cellsByPosition.get(key); return <span className="ah-full-neck-cell" key={fret}>{cell && <button type="button" className={`ah-layer-dot ${cell.primary.layer} ${visibleRoot(cell) ? 'root' : ''} ${cell.marker} ${cell.segments.length > 1 ? 'multi' : ''}`} style={markerStyle(cell)} title={markerTitle(cell)} aria-label={`${selectedCellKey === key ? 'Selected. ' : ''}${markerTitle(cell)}`} aria-pressed={selectedCellKey === key} onClick={() => setSelectedCellKey(key)}><small>{cell.primary.interval}</small></button>}</span>; })}</div>)}</div></div>
  </section>;
}

export const AfterHoursFretboardCustomizer = FretboardMap;
