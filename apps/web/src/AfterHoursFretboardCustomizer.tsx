import { useMemo, useState } from 'react';
import type { ArpType } from './after-hours-types';
import { CAGED_POSITIONS, PENTATONIC_BOXES } from './after-hours-shapes';

type Layer = 'caged' | 'pentatonic' | 'arpeggio' | 'scale';
type LayerDot = { layer: Layer; label: string; root: boolean };
type ChordOption = { label: string; root?: string; quality?: ArpType };
type ScaleKind = 'major' | 'dorian' | 'mixolydian' | 'locrian';

export type FretboardMapProps = {
  keyLabel: string;
  majorRoot: string;
  minorRoot: string;
  chords: ChordOption[];
  description: string;
  cagedLabel: string;
  pentatonicLabel: string;
  defaultLayers?: Partial<Record<Layer, boolean>>;
};

const FRET_COUNT = 16;
const DISPLAY_STRINGS = [
  { label: 'e', pc: 4, source: 5 },
  { label: 'B', pc: 11, source: 4 },
  { label: 'G', pc: 7, source: 3 },
  { label: 'D', pc: 2, source: 2 },
  { label: 'A', pc: 9, source: 1 },
  { label: 'E', pc: 4, source: 0 }
];
const PCS: Record<string, number> = { C:0,'C♯':1,Db:1,'D♭':1,D:2,'D♯':3,Eb:3,'E♭':3,E:4,F:5,'F♯':6,Gb:6,'G♭':6,G:7,'G♯':8,Ab:8,'A♭':8,A:9,'A♯':10,Bb:10,'B♭':10,B:11 };
const LAYERS: Array<{ id: Layer; label: string; detail: string }> = [
  { id:'caged', label:'CAGED', detail:'major-key positions' },
  { id:'pentatonic', label:'Pentatonic', detail:'five connected boxes' },
  { id:'arpeggio', label:'Arpeggio', detail:'active chord tones' },
  { id:'scale', label:'Scale', detail:'active chord scale' }
];
const DEFAULT_LAYERS: Record<Layer, boolean> = { caged:false, pentatonic:true, arpeggio:true, scale:false };
const QUALITY_INTERVALS: Record<ArpType, Array<[number,string]>> = {
  maj7:[[0,'1'],[4,'3'],[7,'5'],[11,'7']],
  m7:[[0,'1'],[3,'♭3'],[7,'5'],[10,'♭7']],
  '7':[[0,'1'],[4,'3'],[7,'5'],[10,'♭7']],
  m7b5:[[0,'1'],[3,'♭3'],[6,'♭5'],[10,'♭7']]
};
const SCALE_INTERVALS: Record<ScaleKind, Array<[number,string]>> = {
  major:[[0,'1'],[2,'2'],[4,'3'],[5,'4'],[7,'5'],[9,'6'],[11,'7']],
  dorian:[[0,'1'],[2,'2'],[3,'♭3'],[5,'4'],[7,'5'],[9,'6'],[10,'♭7']],
  mixolydian:[[0,'1'],[2,'2'],[4,'3'],[5,'4'],[7,'5'],[9,'6'],[10,'♭7']],
  locrian:[[0,'1'],[1,'♭2'],[3,'♭3'],[5,'4'],[6,'♭5'],[8,'♭6'],[10,'♭7']]
};

function rootForLabel(label: string) { return label.match(/^([A-G](?:♭|♯|b|#)?)/)?.[1] ?? 'C'; }
function qualityForLabel(label: string): ArpType { const suffix = label.replace(/^([A-G](?:♭|♯|b|#)?)/, ''); return suffix.includes('m7♭5') ? 'm7b5' : suffix.includes('maj7') ? 'maj7' : suffix.includes('m') ? 'm7' : '7'; }
function scaleForQuality(quality: ArpType): ScaleKind { return quality === 'maj7' ? 'major' : quality === 'm7' ? 'dorian' : quality === 'm7b5' ? 'locrian' : 'mixolydian'; }
function cellKey(source: number, fret: number) { return `${source}:${fret}`; }
function buildPatternSet(patterns: ReadonlyArray<ReadonlyArray<readonly [number, number, string]>>, anchor: number) {
  const set = new Map<string, string>();
  for (const shift of [-24, -12, 0, 12, 24]) {
    for (const pattern of patterns) for (const [source, offset, label] of pattern) {
      const fret = anchor + offset + shift;
      if (fret >= 0 && fret < FRET_COUNT) set.set(cellKey(source, fret), label);
    }
  }
  return set;
}
function membership(openPc: number, fret: number, rootPc: number, intervals: Array<[number,string]>) {
  const delta = (openPc + fret - rootPc + 24) % 12;
  return intervals.find(([value]) => value === delta)?.[1];
}

/**
 * Shared full-neck primitive. After Hours uses all layers; lessons can pass a
 * roots-only layer preset or a filtered chord list without drawing a second fretboard.
 */
export function FretboardMap({ keyLabel, majorRoot, minorRoot, chords, description, cagedLabel, pentatonicLabel, defaultLayers }: FretboardMapProps) {
  const [enabled, setEnabled] = useState<Record<Layer, boolean>>({ ...DEFAULT_LAYERS, ...defaultLayers });
  const [activeChordLabel, setActiveChordLabel] = useState(chords[0]?.label ?? 'C');
  const activeChord = chords.find(chord => chord.label === activeChordLabel) ?? chords[0] ?? { label:'C7' };
  const activeRoot = activeChord.root ?? rootForLabel(activeChord.label);
  const activeQuality = activeChord.quality ?? qualityForLabel(activeChord.label);
  const majorPc = PCS[majorRoot] ?? 0;
  const minorPc = PCS[minorRoot] ?? 0;
  const activePc = PCS[activeRoot] ?? 0;
  const cagedSet = useMemo(() => buildPatternSet(CAGED_POSITIONS.map(item => item.offsets), ((majorPc - 4 + 12) % 12)), [majorPc]);
  const pentatonicSet = useMemo(() => buildPatternSet(PENTATONIC_BOXES, ((minorPc - 4 + 12) % 12)), [minorPc]);
  const arpeggioIntervals = QUALITY_INTERVALS[activeQuality];
  const scaleIntervals = SCALE_INTERVALS[scaleForQuality(activeQuality)];
  const frets = Array.from({ length:FRET_COUNT }, (_, index) => index);
  const dotsFor = (string: typeof DISPLAY_STRINGS[number], fret: number): LayerDot[] => {
    const dots: LayerDot[] = [];
    const caged = cagedSet.get(cellKey(string.source, fret));
    const pentatonic = pentatonicSet.get(cellKey(string.source, fret));
    const arp = membership(string.pc, fret, activePc, arpeggioIntervals);
    const scale = membership(string.pc, fret, activePc, scaleIntervals);
    if (enabled.caged && caged) dots.push({ layer:'caged', label:caged, root:caged === '1' });
    if (enabled.pentatonic && pentatonic) dots.push({ layer:'pentatonic', label:pentatonic, root:pentatonic === '1' });
    if (enabled.arpeggio && arp) dots.push({ layer:'arpeggio', label:arp, root:arp === '1' });
    if (enabled.scale && scale) dots.push({ layer:'scale', label:scale, root:scale === '1' });
    return dots;
  };
  return <section className="ah-fretboard-customizer">
    <div className="ah-piece-section-head"><div><span className="eyebrow">Shapes and voicings</span><h2>One neck. Every map you need.</h2><p>{description}</p></div><div className="ah-fretboard-key"><small>Study key</small><strong>{keyLabel}</strong></div></div>
    <div className="ah-fretboard-controls"><label className="ah-fretboard-chord"><span>Active chord</span><select value={activeChordLabel} onChange={event => setActiveChordLabel(event.target.value)}>{chords.map(chord => <option key={chord.label} value={chord.label}>{chord.label}</option>)}</select></label><div className="ah-fretboard-layers" aria-label="Fretboard layers">{LAYERS.map(layer => <button type="button" key={layer.id} className={`layer-${layer.id} ${enabled[layer.id] ? 'active' : ''}`} aria-pressed={enabled[layer.id]} onClick={() => setEnabled(previous => ({ ...previous, [layer.id]: !previous[layer.id] }))}><i aria-hidden="true"/><span>{layer.label}</span><small>{layer.id === 'caged' ? cagedLabel : layer.id === 'pentatonic' ? pentatonicLabel : layer.detail}</small></button>)}</div></div>
    <div className="ah-fretboard-legend"><span><b className="root-key">1</b> Root notes use black ink on a light marker.</span><span>High <b>e</b> is on top. Low <b>E</b> is on bottom.</span><span>0–15 frets · first repeated position after 12th fret included.</span></div>
    <div className="ah-full-neck-scroll" tabIndex={0} role="region" aria-label="Full fretboard with selectable study layers"><div className="ah-full-neck"><div className="ah-full-neck-frets"><span></span>{frets.map(fret => <span key={fret}>{fret}</span>)}</div>{DISPLAY_STRINGS.map(string => <div className="ah-full-neck-string" key={string.label}><b>{string.label}</b>{frets.map(fret => <span className="ah-full-neck-cell" key={fret}>{dotsFor(string, fret).map((dot, index) => <i key={`${dot.layer}-${index}`} className={`ah-layer-dot ${dot.layer} ${dot.root ? 'root' : ''}`} title={`${dot.layer}: ${dot.label}`}><small>{dot.label}</small></i>)}</span>)}</div>)}</div></div>
  </section>;
}

export const AfterHoursFretboardCustomizer = FretboardMap;
