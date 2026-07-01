import type { ArpType, FormSection } from './after-hours-types';
import type { ShapeTone } from './after-hours-shapes';

type Diagram = { title: string; subtitle: string; notes: Array<{ string: number; fret: number; label: string; root?: boolean }> };
type RootString = 'E' | 'A';
type Voicing = { chord: string; root: string; quality: ArpType; rootString: RootString };

const STRINGS = ['E', 'A', 'D', 'G', 'B', 'e'];
const PCS: Record<string, number> = { C:0,'C♯':1,Db:1,'D♭':1,D:2,'D♯':3,Eb:3,'E♭':3,E:4,F:5,'F♯':6,Gb:6,'G♭':6,G:7,'G♯':8,Ab:8,'A♭':8,A:9,'A♯':10,Bb:10,'B♭':10,B:11 };
const CHORD_TITLE = /^[A-G](?:♭|♯|b|#)?(?:maj7|m7♭5|m7|m|7)?$/;

export function chordMarkup(value: string) {
  const match = value.match(/^([A-G])([♭♯b#]?)(.*)$/);
  return <span className="chord-symbol"><span className="chord-root">{match?.[1] ?? value}</span>{match?.[2] && <sup className="music-accidental">{match[2].replace('b','♭').replace('#','♯')}</sup>}{match?.[3] && <sup className="chord-quality">{match[3]}</sup>}</span>;
}

export function makeDiagram(title: string, subtitle: string, anchor: number, offsets: ReadonlyArray<ShapeTone>): Diagram {
  return { title, subtitle, notes: offsets.map(([string, fret, label]) => ({ string, fret: anchor + fret, label, root: label === '1' })) };
}

function parseChord(chord: string): Omit<Voicing, 'chord' | 'rootString'> {
  const match = chord.match(/^([A-G](?:♭|♯|b|#)?)(.*)$/); const suffix = match?.[2] ?? '';
  return { root: match?.[1] ?? 'C', quality: suffix.includes('m7♭5') ? 'm7b5' : suffix.includes('maj7') ? 'maj7' : suffix.includes('m') ? 'm7' : '7' };
}
function rootString(root: string, quality: ArpType): RootString { const lowE = ((PCS[root] ?? 0) - 4 + 12) % 12; return quality === 'm7b5' || lowE > 7 ? 'A' : 'E'; }
function rootFret(root: string, on: RootString) { return ((PCS[root] ?? 0) - (on === 'E' ? 4 : 9) + 12) % 12; }

export function voicingsFor(form: FormSection[]): Voicing[] {
  const labels = [...new Set(form.flatMap(section => section.bars.flat().map(cell => cell.label)))];
  return labels.filter(label => !label.includes('/')).slice(0, 7).map(chord => { const parsed = parseChord(chord); return { chord, ...parsed, rootString: rootString(parsed.root, parsed.quality) }; });
}

export function makeShellDiagram(voicing: Voicing): Diagram {
  const E: Record<ArpType, ReadonlyArray<ShapeTone>> = {
    maj7:[[0,0,'1'],[2,1,'7'],[3,1,'3'],[4,0,'5']], m7:[[0,0,'1'],[2,0,'♭7'],[3,0,'♭3'],[4,0,'5']], '7':[[0,0,'1'],[2,0,'♭7'],[3,1,'3'],[4,0,'5']], m7b5:[[0,0,'1'],[2,0,'♭7'],[3,0,'♭3'],[4,-1,'♭5']]
  };
  const A: Record<ArpType, ReadonlyArray<ShapeTone>> = {
    maj7:[[1,0,'1'],[2,2,'5'],[3,1,'7'],[4,2,'3']], m7:[[1,0,'1'],[2,2,'5'],[3,0,'♭7'],[4,1,'♭3']], '7':[[1,0,'1'],[2,2,'5'],[3,0,'♭7'],[4,1,'3']], m7b5:[[1,0,'1'],[2,1,'♭5'],[3,0,'♭7'],[4,1,'♭3']]
  };
  return makeDiagram(voicing.chord, 'Four-note shell voicing', rootFret(voicing.root, voicing.rootString), voicing.rootString === 'E' ? E[voicing.quality] : A[voicing.quality]);
}

export function DiagramCard({ diagram }: { diagram: Diagram }) {
  const values = diagram.notes.map(note => note.fret).filter(fret => fret >= 0); const start = Math.max(0, Math.min(...values)); const end = Math.max(...values); const frets = Array.from({ length: Math.max(5, end - start + 1) }, (_, index) => start + index);
  return <article className="ah-port-diagram"><div className="ah-port-diagram-title"><strong>{CHORD_TITLE.test(diagram.title) ? chordMarkup(diagram.title) : diagram.title}</strong><small>{diagram.subtitle}</small></div><div className="ah-port-neck" aria-label={diagram.title}><div className="ah-port-frets"><span></span>{frets.map(fret => <span key={fret}>{fret}</span>)}</div>{STRINGS.map((string, index) => <div className="ah-port-string" key={string}><b>{string}</b>{frets.map(fret => { const tone = diagram.notes.find(note => note.string === index && note.fret === fret); return <span key={fret}>{tone && <i className={tone.root ? 'root' : ''}><small>{tone.label}</small></i>}</span>; })}</div>)}</div></article>;
}

export function FormMap({ form }: { form: FormSection[] }) {
  return <div className="ah-port-form">{form.map(section => <section key={section.name}><header>{section.name}</header><div>{section.bars.map((bar, index) => <article key={index}>{bar.map(cell => <span key={cell.label}>{chordMarkup(cell.label)}{cell.roman && <small>{cell.roman}</small>}</span>)}</article>)}</div></section>)}</div>;
}
