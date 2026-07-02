import { useMemo, useState } from 'react';
import {
  buildChord,
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
  type ChordQuality,
  type IntervalPosition,
  type LayerMembership,
  type ScaleMode,
  type SpelledNote
} from './lib/music';

type ExplorerLayer = 'caged' | 'pentatonic' | 'arpeggio' | 'scale';
type ExplorerMembership = LayerMembership & { note: SpelledNote; title: string; color: string };
type ExplorerCell = ReturnType<typeof resolveLayerCells>[number] & { memberships: readonly ExplorerMembership[]; primary: ExplorerMembership };

export type ExplorerSetup = {
  root: string;
  scaleMode: ScaleMode;
  chordQuality: ChordQuality;
  view: 'layers' | 'roots';
};

const FRET_NUMBERS = Array.from({ length: DEFAULT_FRET_RANGE.end - DEFAULT_FRET_RANGE.start + 1 }, (_, index) => DEFAULT_FRET_RANGE.start + index);
const DISPLAY_STRINGS = displayStringOrder(STANDARD_TUNING).map(index => ({ index, label: index === 5 ? 'e' : noteToString(STANDARD_TUNING.openStrings[index]) }));
const LAYER_INFO: Record<ExplorerLayer, { label: string; copy: string; color: string }> = {
  caged: { label: 'CAGED', copy: 'five connected major forms', color: '#84bdff' },
  pentatonic: { label: 'Pentatonic', copy: 'five minor boxes', color: '#f7bf65' },
  arpeggio: { label: 'Arpeggio', copy: 'selected chord tones', color: '#e69bc6' },
  scale: { label: 'Scale', copy: 'selected key context', color: '#83d5b7' }
};
const DEFAULT_LAYERS: Record<ExplorerLayer, boolean> = { caged: false, pentatonic: true, arpeggio: true, scale: false };

function positionKey(stringIndex: number, fret: number) { return `${stringIndex}:${fret}`; }

function decorate(layer: ExplorerLayer, title: string, color: string, positions: readonly IntervalPosition[]): ExplorerMembership[] {
  return positions.map(position => ({ ...position, layer, title, color }));
}

function colorForCell(cell: ExplorerCell) {
  if (cell.primary.interval === '1') return '#f5d46b';
  return cell.primary.color;
}

export function ExplorerFretboard({ setup }: { setup: ExplorerSetup }) {
  const [enabled, setEnabled] = useState<Record<ExplorerLayer, boolean>>(DEFAULT_LAYERS);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const chord = useMemo(() => buildChord(setup.root, setup.chordQuality), [setup.root, setup.chordQuality]);
  const key = useMemo(() => createKey(setup.root, setup.scaleMode), [setup.root, setup.scaleMode]);
  const cells = useMemo(() => {
    const root = parseNote(setup.root);
    if (setup.view === 'roots') {
      const roots = decorate('arpeggio', 'Root', '#f5d46b', positionsForIntervals(root, ['1'], 'root'));
      return new Map(resolveLayerCells(roots, { focusLayer: 'arpeggio' }).map(cell => [positionKey(cell.stringIndex, cell.fret), cell as ExplorerCell]));
    }

    const memberships: ExplorerMembership[] = [];
    if (enabled.caged) {
      const shapes = generateCagedMajorCycle(root).flatMap(shape => shape.positions.filter(position => position.fret >= DEFAULT_FRET_RANGE.start && position.fret <= DEFAULT_FRET_RANGE.end));
      memberships.push(...decorate('caged', 'CAGED major form', LAYER_INFO.caged.color, shapes));
    }
    if (enabled.pentatonic) {
      const boxes = generateMinorPentatonicCycle(root, STANDARD_TUNING, DEFAULT_FRET_RANGE).flatMap(box => box.positions);
      memberships.push(...decorate('pentatonic', 'Minor pentatonic box', LAYER_INFO.pentatonic.color, boxes));
    }
    if (enabled.arpeggio) memberships.push(...decorate('arpeggio', chordSymbol(chord), LAYER_INFO.arpeggio.color, positionsForChord(chord)));
    if (enabled.scale) memberships.push(...decorate('scale', `${noteToString(key.tonic)} ${setup.scaleMode}`, LAYER_INFO.scale.color, positionsForScale(key)));

    return new Map(resolveLayerCells(memberships, { focusLayer: 'arpeggio' }).map(cell => [positionKey(cell.stringIndex, cell.fret), cell as ExplorerCell]));
  }, [chord, enabled, key, setup.root, setup.scaleMode, setup.view]);

  const selected = selectedPosition ? cells.get(selectedPosition) : undefined;

  return <section className="explorer-neck" aria-label="Interactive fretboard">
    <div className="explorer-layer-controls" aria-label="Fretboard layers">
      {setup.view === 'layers' && (Object.keys(LAYER_INFO) as ExplorerLayer[]).map(layer => <button key={layer} type="button" className={enabled[layer] ? 'active' : ''} aria-pressed={enabled[layer]} onClick={() => { setEnabled(previous => ({ ...previous, [layer]: !previous[layer] })); setSelectedPosition(null); }}>
        <i style={{ background: LAYER_INFO[layer].color }} aria-hidden="true" />
        <span><strong>{LAYER_INFO[layer].label}</strong><small>{LAYER_INFO[layer].copy}</small></span>
      </button>)}
    </div>
    <p className="explorer-neck-legend">{setup.view === 'roots' ? 'Every highlighted note is the selected root.' : 'Arpeggio labels take priority when maps overlap. Tap a marker for every role at that fret.'}</p>
    {selected && <aside className="explorer-fret-detail" aria-live="polite">
      <div><span>Fret detail</span><strong>{noteToString(selected.primary.note)} · string {DISPLAY_STRINGS.find(string => string.index === selected.stringIndex)?.label} · fret {selected.fret}</strong></div>
      <button type="button" aria-label="Close fret detail" onClick={() => setSelectedPosition(null)}>×</button>
      <ul>{selected.memberships.map((membership, index) => <li key={`${membership.layer}-${membership.title}-${membership.interval}-${index}`}><i style={{ background: membership.interval === '1' ? '#f5d46b' : membership.color }} aria-hidden="true" /><span>{membership.title}</span><b>{membership.interval}{membership.role === 'root' ? ' · root' : ''}</b></li>)}</ul>
    </aside>}
    <div className="explorer-neck-scroll" tabIndex={0} role="region" aria-label="Full guitar fretboard">
      <div className="explorer-neck-grid">
        <div className="explorer-fret-numbers"><span></span>{FRET_NUMBERS.map(fret => <span key={fret}>{fret}</span>)}</div>
        {DISPLAY_STRINGS.map(string => <div className="explorer-string" key={string.index}><b>{string.label}</b>{FRET_NUMBERS.map(fret => {
          const keyAtFret = positionKey(string.index, fret);
          const cell = cells.get(keyAtFret);
          return <span className="explorer-fret-cell" key={fret}>{cell && <button type="button" className={`explorer-marker ${cell.primary.interval === '1' ? 'root' : ''} ${cell.marker}`} style={{ background: colorForCell(cell) }} aria-label={`${noteToString(cell.primary.note)}, fret ${fret}, ${cell.primary.interval}`} aria-pressed={selectedPosition === keyAtFret} onClick={() => setSelectedPosition(keyAtFret)}><small>{cell.primary.interval}</small></button>}</span>;
        })}</div>)}
      </div>
    </div>
  </section>;
}
