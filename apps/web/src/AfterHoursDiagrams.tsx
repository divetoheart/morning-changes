import type { FormSection } from './after-hours-types';
import { GuitarDiagram } from './GuitarDiagram';
import { ChordNotation, FunctionNotation } from './MusicNotation';
import {
  chordSymbol,
  generateVoicing,
  selectGuitarVoicingCandidate,
  type Chord,
  type GuitarVoicingCandidate
} from './lib/music';

export type Voicing = {
  chord: Chord;
  preferredFret?: number;
};

export type Diagram = {
  chord: Chord;
  subtitle: string;
  candidate?: GuitarVoicingCandidate;
};

/** Compatibility export for consumers that already carry a typed Chord. */
export function chordMarkup(chord: Chord) {
  return <ChordNotation chord={chord} />;
}

/** Reads the selected form as typed chord data; no display-label parsing. */
export function voicingsFor(form: FormSection[]): Voicing[] {
  const uniqueChords = new Map<string, Chord>();
  for (const cell of form.flatMap(section => section.bars.flat())) uniqueChords.set(chordSymbol(cell.chord), cell.chord);
  return [...uniqueChords.values()].filter(chord => chord.tones.length === 4).map(chord => ({ chord }));
}

/**
 * Builds a real shell recipe, then finds one playable placement on a declared
 * string set. The renderer receives only the selected engine positions.
 */
export function makeShellDiagram({ chord, preferredFret }: Voicing): Diagram {
  const generated = generateVoicing(chord, { kind: 'shell', includeRoot: true, includeFifth: true, guideToneOrder: '7-3' });
  const candidate = selectGuitarVoicingCandidate(generated, {
    stringSets: [[0, 2, 3, 4], [1, 2, 3, 4], [2, 3, 4, 5]],
    preferredFret,
    fretRange: { start: 0, end: 15 },
    maxFretSpan: 5
  });
  return { chord, subtitle: 'Generated four-note shell voicing', candidate };
}

export function DiagramCard({ diagram }: { diagram: Diagram }) {
  if (!diagram.candidate) {
    return <article className="ah-port-diagram guitar-diagram"><div className="ah-port-diagram-title"><strong><ChordNotation chord={diagram.chord} /></strong><small>{diagram.subtitle}</small></div><p className="diagram-unavailable">No playable placement was found inside this study range.</p></article>;
  }
  return <GuitarDiagram chord={diagram.chord} subtitle={diagram.subtitle} tones={diagram.candidate.positions} />;
}

export function FormMap({ form }: { form: FormSection[] }) {
  return <div className="ah-port-form">{form.map(section => <section key={section.name}><header>{section.name}</header><div>{section.bars.map((bar, index) => <article key={index}>{bar.map(cell => <span key={`${chordSymbol(cell.chord)}-${cell.function?.degree ?? ''}`}><ChordNotation chord={cell.chord} />{cell.function && <small><FunctionNotation functional={cell.function} /></small>}</span>)}</article>)}</div></section>)}</div>;
}