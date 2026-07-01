import { ARPEGGIO_PATTERNS, CAGED_POSITIONS, PENTATONIC_BOXES, SCALE_PATTERNS } from './after-hours-shapes';
import { DiagramCard, FormMap, chordMarkup, makeDiagram, makeShellDiagram, voicingsFor } from './AfterHoursDiagrams';
import type { ArpType, ScaleType, StudyKey } from './after-hours-types';

export type AutumnView = 'chords' | 'caged' | 'pentatonic' | 'arpeggios' | 'scales';

export function AutumnStudyViews({ study, view }: { study: StudyKey; view: AutumnView }) {
  const caged = CAGED_POSITIONS.map(item => makeDiagram(`CAGED — ${item.shape}-shape`, `${study.majorKey} scale · ${item.shape} form`, study.majorRoot, item.offsets));
  const pentatonic = PENTATONIC_BOXES.map((box, index) => makeDiagram(`Minor Pentatonic — Box ${index + 1}`, `${study.minorKey} pentatonic`, study.minorRoot, box));
  const arpeggios = study.arpeggios.map(item => makeDiagram(`${item.chord} arpeggio`, 'Two-octave chord-tone shape', item.anchor, ARPEGGIO_PATTERNS[item.type as ArpType]));
  const scales = study.scales.map(item => makeDiagram(item.name, item.description, item.anchor, SCALE_PATTERNS[item.type as ScaleType]));
  const voicings = voicingsFor(study.form).map(makeShellDiagram);

  return <section className="ah-port-view">
    {view === 'chords' && <div className="ah-port-chords"><div><span className="eyebrow">Study changes / harmonic map</span><FormMap form={study.form} /></div><div><span className="eyebrow">Core voicings</span><p className="ah-port-explainer short">Actual shell-voicing diagrams for the selected key.</p><div className="ah-port-voicing-diagrams">{voicings.map(diagram => <DiagramCard key={diagram.title} diagram={diagram} />)}</div></div></div>}
    {view === 'caged' && <div><span className="eyebrow">CAGED — {study.majorKey} scale</span><p className="ah-port-explainer">Five distinct connected positions from the original guide. Every diagram is recalculated from the selected major root; no position is reused from another key.</p><div className="ah-port-diagram-grid three">{caged.map(diagram => <DiagramCard key={diagram.title} diagram={diagram} />)}</div></div>}
    {view === 'pentatonic' && <div><span className="eyebrow">Pentatonic — {study.minorKey}</span><p className="ah-port-explainer">All five minor-pentatonic boxes, placed from the selected minor root. The same notes give the relative-major pentatonic color over the major portion of the form.</p><div className="ah-port-diagram-grid two">{pentatonic.map(diagram => <DiagramCard key={diagram.title} diagram={diagram} />)}</div></div>}
    {view === 'arpeggios' && <div><span className="eyebrow">Arpeggios — chord tones for each change</span><p className="ah-port-explainer">Two-octave shapes for the principal chords in this key. Practice them straight, then connect to the nearest chord tone at the barline.</p><div className="ah-port-diagram-grid two">{arpeggios.map(diagram => <DiagramCard key={diagram.title} diagram={diagram} />)}</div></div>}
    {view === 'scales' && <div className="ah-port-scales"><div><span className="eyebrow">Scale shapes</span><div className="ah-port-diagram-grid two">{scales.map(diagram => <DiagramCard key={diagram.title} diagram={diagram} />)}</div></div><div><span className="eyebrow">Mode map</span><ul>{study.modes.map(([chord, mode, tip]) => <li key={chord}><div>{chordMarkup(chord)}<strong>{mode}</strong></div><p>{tip}</p></li>)}</ul></div></div>}
  </section>;
}
