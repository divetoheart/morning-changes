import { useMemo, useState } from 'react';

type TabId = 'chords' | 'caged' | 'pentatonic' | 'arpeggios' | 'scales';
type HarmonyCell = { label: string; roman?: string };
type FormSection = { name: string; bars: HarmonyCell[][] };
type ModeNote = { chord: string; scale: string; tip: string };
type Shape = { title: string; subtitle: string; startFret: number; frets: number; notes: Array<{ string: number; fret: number; label: string; root?: boolean }> };
type KeyStudy = { id: string; label: string; short: string; minorKey: string; majorKey: string; rationale: string; form: FormSection[]; voicings: Array<{ chord: string; subtitle: string }>; minorRootFret: number; majorRootFret: number; arpeggios: Array<{ chord: string; anchor: number; type: ArpType }>; scales: Array<{ name: string; description: string; anchor: number; type: ScaleType }>; modeNotes: ModeNote[] };
type ArpType = 'maj7' | 'm7' | '7' | 'm7b5';
type ScaleType = 'major' | 'dorian' | 'mixolydian' | 'halfWhole';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'chords', label: 'Chords' },
  { id: 'caged', label: 'CAGED' },
  { id: 'pentatonic', label: 'Pentatonic' },
  { id: 'arpeggios', label: 'Arpeggios' },
  { id: 'scales', label: 'Scales' }
];

const gmForm: FormSection[] = [
  { name: 'A', bars: [[{ label: 'Cm7', roman: 'iiⁿ' }], [{ label: 'F7', roman: 'V⁷' }], [{ label: 'B♭maj7', roman: 'Iᶜ' }], [{ label: 'E♭maj7', roman: 'IVᶜ' }], [{ label: 'Am7♭5', roman: 'iiø' }], [{ label: 'D7', roman: 'V⁷/i' }], [{ label: 'Gm', roman: 'i' }], [{ label: 'Gm', roman: 'i' }]] },
  { name: 'A′', bars: [[{ label: 'Cm7', roman: 'iiⁿ' }], [{ label: 'F7', roman: 'V⁷' }], [{ label: 'B♭maj7', roman: 'Iᶜ' }], [{ label: 'E♭maj7', roman: 'IVᶜ' }], [{ label: 'Am7♭5', roman: 'iiø' }], [{ label: 'D7', roman: 'V⁷/i' }], [{ label: 'Gm', roman: 'i' }], [{ label: 'Gm', roman: 'i' }]] },
  { name: 'B', bars: [[{ label: 'Am7♭5', roman: 'iiø' }], [{ label: 'D7', roman: 'V⁷/i' }], [{ label: 'Gm', roman: 'i' }], [{ label: 'Gm', roman: 'i' }], [{ label: 'Cm7', roman: 'iiⁿ' }], [{ label: 'F7', roman: 'V⁷' }], [{ label: 'B♭maj7', roman: 'Iᶜ' }], [{ label: 'B♭maj7', roman: 'Iᶜ' }]] },
  { name: 'C', bars: [[{ label: 'Am7♭5', roman: 'iiø' }], [{ label: 'D7', roman: 'V⁷/i' }], [{ label: 'Gm', roman: 'i' }, { label: 'Gm7' }], [{ label: 'Cm7' }, { label: 'F7' }], [{ label: 'B♭maj7' }, { label: 'E♭7' }], [{ label: 'Am7♭5' }, { label: 'D7' }], [{ label: 'Gm', roman: 'i' }], [{ label: 'Gm', roman: 'i' }]] }
];
const emForm: FormSection[] = [
  { name: 'A', bars: [[{ label: 'Am7', roman: 'iiⁿ' }], [{ label: 'D7', roman: 'V⁷' }], [{ label: 'Gmaj7', roman: 'Iᶜ' }], [{ label: 'Cmaj7', roman: 'IVᶜ' }], [{ label: 'F♯m7♭5', roman: 'iiø' }], [{ label: 'B7', roman: 'V⁷/i' }], [{ label: 'Em', roman: 'i' }], [{ label: 'Em', roman: 'i' }]] },
  { name: 'A′', bars: [[{ label: 'Am7' }], [{ label: 'D7' }], [{ label: 'Gmaj7' }], [{ label: 'Cmaj7' }], [{ label: 'F♯m7♭5' }], [{ label: 'B7' }], [{ label: 'Em' }], [{ label: 'Em' }]] },
  { name: 'B', bars: [[{ label: 'F♯m7♭5' }], [{ label: 'B7' }], [{ label: 'Em' }], [{ label: 'Em' }], [{ label: 'Am7' }], [{ label: 'D7' }], [{ label: 'Gmaj7' }], [{ label: 'Gmaj7' }]] },
  { name: 'C', bars: [[{ label: 'F♯m7♭5' }], [{ label: 'B7' }], [{ label: 'Em' }, { label: 'Em7' }], [{ label: 'Am7' }, { label: 'D7' }], [{ label: 'Gmaj7' }, { label: 'C7' }], [{ label: 'F♯m7♭5' }, { label: 'B7' }], [{ label: 'Em' }], [{ label: 'Em' }]] }
];
const amForm: FormSection[] = [
  { name: 'A', bars: [[{ label: 'Dm7', roman: 'iiⁿ' }], [{ label: 'G7', roman: 'V⁷' }], [{ label: 'Cmaj7', roman: 'Iᶜ' }], [{ label: 'Fmaj7', roman: 'IVᶜ' }], [{ label: 'Bm7♭5', roman: 'iiø' }], [{ label: 'E7', roman: 'V⁷/i' }], [{ label: 'Am', roman: 'i' }], [{ label: 'Am', roman: 'i' }]] },
  { name: 'A′', bars: [[{ label: 'Dm7' }], [{ label: 'G7' }], [{ label: 'Cmaj7' }], [{ label: 'Fmaj7' }], [{ label: 'Bm7♭5' }], [{ label: 'E7' }], [{ label: 'Am' }], [{ label: 'Am' }]] },
  { name: 'B', bars: [[{ label: 'Bm7♭5' }], [{ label: 'E7' }], [{ label: 'Am' }], [{ label: 'Am' }], [{ label: 'Dm7' }], [{ label: 'G7' }], [{ label: 'Cmaj7' }], [{ label: 'Cmaj7' }]] },
  { name: 'C', bars: [[{ label: 'Bm7♭5' }], [{ label: 'E7' }], [{ label: 'Am' }, { label: 'Am7' }], [{ label: 'Dm7' }, { label: 'G7' }], [{ label: 'Cmaj7' }, { label: 'F7' }], [{ label: 'Bm7♭5' }, { label: 'E7' }], [{ label: 'Am' }], [{ label: 'Am' }]] }
];

const studies: KeyStudy[] = [
  {
    id: 'gm-bb', label: 'G minor / B♭ major', short: 'Gm / B♭', minorKey: 'G minor', majorKey: 'B♭ major', form: gmForm, minorRootFret: 3, majorRootFret: 6,
    rationale: 'Modern jazz/session standard key. Cannonball Adderley’s Somethin’ Else (1958) with Miles Davis is the canonical recording in this key, and it sits comfortably for horns and most piano players.',
    voicings: [{ chord: 'Cm7', subtitle: 'iiⁿ — 3rd-fret A-string root' }, { chord: 'F7', subtitle: 'V⁷ — E-shape' }, { chord: 'B♭maj7', subtitle: 'Iᶜ — 1st-fret A-string root' }, { chord: 'E♭maj7', subtitle: 'IVᶜ — 6th-fret A-shape' }, { chord: 'Am7♭5', subtitle: 'iiø — 5th-fret shell' }, { chord: 'D7', subtitle: 'V⁷/i — 5th-fret A-shape' }, { chord: 'Gm', subtitle: 'i — 3rd-fret E-shape' }],
    arpeggios: [{ chord: 'Cm7', anchor: 8, type: 'm7' }, { chord: 'F7', anchor: 8, type: '7' }, { chord: 'B♭maj7', anchor: 6, type: 'maj7' }, { chord: 'Am7♭5', anchor: 5, type: 'm7b5' }, { chord: 'D7', anchor: 5, type: '7' }, { chord: 'Gm', anchor: 3, type: 'm7' }],
    scales: [{ name: 'B♭ major scale', description: 'Use over B♭Maj7 and E♭Maj7', anchor: 6, type: 'major' }, { name: 'C dorian', description: 'Use over Cm7', anchor: 8, type: 'dorian' }, { name: 'F mixolydian', description: 'Use over F7', anchor: 8, type: 'mixolydian' }, { name: 'D half-whole diminished', description: 'Tension over D7 to G minor', anchor: 5, type: 'halfWhole' }],
    modeNotes: [{ chord: 'Cm7', scale: 'C dorian (notes of B♭ major)', tip: 'Lean on 9 (D) and 13 (A) for color.' }, { chord: 'F7', scale: 'F mixolydian', tip: 'Approach the B♭ landing through F–E♭–D.' }, { chord: 'B♭maj7', scale: 'B♭ Ionian', tip: 'Aim for 3 (D) and 9 (C) at downbeats.' }, { chord: 'E♭maj7', scale: 'E♭ Lydian or B♭ major', tip: 'Use #11 (A) to color this IV.' }, { chord: 'Am7♭5', scale: 'A locrian ♮2 (melodic minor of B♭)', tip: 'Highlight E♭ (♭5) and B♮ (9).' }, { chord: 'D7', scale: 'D phrygian dominant / altered', tip: 'Resolve E♭ down to D over Gm.' }, { chord: 'Gm', scale: 'G dorian / harmonic minor over V7', tip: 'B♭, A, G are strong landings.' }]
  },
  {
    id: 'em-g', label: 'E minor / G major', short: 'Em / G', minorKey: 'E minor', majorKey: 'G major', form: emForm, minorRootFret: 0, majorRootFret: 3,
    rationale: 'The most common guitar-friendly Real Book key. Open chords, every change reachable in first position, and great for learning the form with open-string colors.',
    voicings: [{ chord: 'Am7', subtitle: 'iiⁿ — open' }, { chord: 'D7', subtitle: 'V⁷ — open' }, { chord: 'Gmaj7', subtitle: 'Iᶜ — open' }, { chord: 'Cmaj7', subtitle: 'IVᶜ — open' }, { chord: 'F♯m7♭5', subtitle: 'iiø — 2nd-fret shell' }, { chord: 'B7', subtitle: 'V⁷/i — 2nd-fret A-shape' }, { chord: 'Em', subtitle: 'i — open' }],
    arpeggios: [{ chord: 'Am7', anchor: 5, type: 'm7' }, { chord: 'D7', anchor: 5, type: '7' }, { chord: 'Gmaj7', anchor: 3, type: 'maj7' }, { chord: 'F♯m7♭5', anchor: 2, type: 'm7b5' }, { chord: 'B7', anchor: 2, type: '7' }, { chord: 'Em', anchor: 0, type: 'm7' }],
    scales: [{ name: 'G major scale', description: 'Use over GMaj7 and CMaj7', anchor: 3, type: 'major' }, { name: 'A dorian', description: 'Use over Am7', anchor: 5, type: 'dorian' }, { name: 'D mixolydian', description: 'Use over D7', anchor: 5, type: 'mixolydian' }, { name: 'B half-whole diminished', description: 'Tension over B7 to E minor', anchor: 2, type: 'halfWhole' }],
    modeNotes: [{ chord: 'Am7', scale: 'A dorian', tip: 'Hold the 9 (B) and 6 (F♯).' }, { chord: 'D7', scale: 'D mixolydian', tip: 'Approach the G landing through F♯ and E.' }, { chord: 'Gmaj7', scale: 'G Ionian', tip: 'B and A as resting tones.' }, { chord: 'Cmaj7', scale: 'C Lydian or G major', tip: 'F♯ as #11 adds shimmer.' }, { chord: 'F♯m7♭5', scale: 'F♯ locrian ♮2', tip: 'Aim for C (♭5) and G♯ (9).' }, { chord: 'B7', scale: 'B phrygian dominant / altered', tip: 'C♮ and D♮ as upper tensions.' }, { chord: 'Em', scale: 'E dorian or harmonic minor over B7', tip: 'Resolve to E or G chord tones.' }]
  },
  {
    id: 'am-c', label: 'A minor / C major', short: 'Am / C', minorKey: 'A minor', majorKey: 'C major', form: amForm, minorRootFret: 5, majorRootFret: 8,
    rationale: 'Original / early edition key according to historical research. Best for studying the tune’s open-position roots and seeing the ii–V–I motion in C as a no-sharps-no-flats template.',
    voicings: [{ chord: 'Dm7', subtitle: 'iiⁿ — open' }, { chord: 'G7', subtitle: 'V⁷ — open' }, { chord: 'Cmaj7', subtitle: 'Iᶜ — open' }, { chord: 'Fmaj7', subtitle: 'IVᶜ — open' }, { chord: 'Bm7♭5', subtitle: 'iiø — 7th-fret shell' }, { chord: 'E7', subtitle: 'V⁷/i — open' }, { chord: 'Am', subtitle: 'i — open' }],
    arpeggios: [{ chord: 'Dm7', anchor: 10, type: 'm7' }, { chord: 'G7', anchor: 3, type: '7' }, { chord: 'Cmaj7', anchor: 8, type: 'maj7' }, { chord: 'Bm7♭5', anchor: 7, type: 'm7b5' }, { chord: 'E7', anchor: 7, type: '7' }, { chord: 'Am', anchor: 5, type: 'm7' }],
    scales: [{ name: 'C major scale', description: 'Use over CMaj7 and FMaj7', anchor: 8, type: 'major' }, { name: 'D dorian', description: 'Use over Dm7', anchor: 10, type: 'dorian' }, { name: 'G mixolydian', description: 'Use over G7', anchor: 3, type: 'mixolydian' }, { name: 'E half-whole diminished', description: 'Tension over E7 to A minor', anchor: 7, type: 'halfWhole' }],
    modeNotes: [{ chord: 'Dm7', scale: 'D dorian', tip: 'All white keys; lean on the 9 (E) and 6 (B).' }, { chord: 'G7', scale: 'G mixolydian', tip: 'Try F to E motion over the bar.' }, { chord: 'Cmaj7', scale: 'C Ionian', tip: 'E and B make this chord glow.' }, { chord: 'Fmaj7', scale: 'F Lydian or C major', tip: 'B (#11) adds color.' }, { chord: 'Bm7♭5', scale: 'B locrian ♮2', tip: 'F (♭5) and C♯ (9, melodic minor).' }, { chord: 'E7', scale: 'E phrygian dominant / altered', tip: 'F♮ and B♭ as tensions resolving to Am.' }, { chord: 'Am', scale: 'A natural or harmonic minor over E7', tip: 'G♯ over V7, G♮ otherwise.' }]
  }
];

const pentatonicTemplate = [[0,0,'1'],[0,3,'♭3'],[1,0,'4'],[1,2,'5'],[2,0,'♭7'],[2,2,'1'],[3,0,'♭3'],[3,2,'4'],[4,0,'5'],[4,3,'♭7'],[5,0,'1'],[5,3,'♭3']] as const;
const scaleTemplates: Record<ScaleType, ReadonlyArray<readonly [number, number, string]>> = {
  major: [[0,0,'1'],[0,2,'2'],[0,4,'3'],[1,0,'4'],[1,2,'5'],[2,-1,'6'],[2,1,'7'],[2,2,'1'],[3,-1,'2'],[3,1,'3'],[3,2,'4'],[4,0,'5'],[4,2,'6'],[5,0,'1'],[5,2,'2'],[5,4,'3']],
  dorian: [[0,0,'1'],[0,2,'2'],[0,3,'♭3'],[1,0,'4'],[1,2,'5'],[1,3,'6'],[2,0,'♭7'],[2,2,'1'],[2,3,'2'],[3,0,'♭3'],[3,2,'4'],[4,0,'5'],[4,1,'6'],[4,3,'♭7'],[5,0,'1'],[5,2,'2'],[5,3,'♭3']],
  mixolydian: [[0,0,'1'],[0,2,'2'],[0,4,'3'],[1,0,'4'],[1,2,'5'],[1,3,'6'],[2,0,'♭7'],[2,2,'1'],[3,-1,'2'],[3,1,'3'],[3,2,'4'],[4,0,'5'],[4,1,'6'],[4,3,'♭7'],[5,0,'1'],[5,2,'2'],[5,4,'3']],
  halfWhole: [[0,0,'1'],[0,1,'♭9'],[0,3,'♯9'],[1,0,'5'],[1,1,'♯5'],[1,3,'♭7'],[2,0,'1'],[2,1,'♭9'],[2,3,'♯9'],[3,0,'5'],[3,1,'♯5'],[3,3,'♭7'],[4,0,'1'],[4,1,'♭9'],[4,3,'♯9'],[5,0,'5'],[5,1,'♯5'],[5,3,'♭7']]
};
const arpeggioTemplates: Record<ArpType, ReadonlyArray<readonly [number, number, string]>> = {
  maj7: [[0,0,'1'],[0,4,'3'],[1,-1,'5'],[1,2,'7'],[2,-1,'1'],[2,2,'3'],[3,-1,'5'],[3,1,'7'],[4,0,'1'],[4,2,'3']],
  m7: [[0,0,'1'],[0,3,'♭3'],[1,0,'5'],[1,3,'♭7'],[2,0,'1'],[2,2,'♭3'],[3,0,'5'],[3,1,'♭7'],[4,0,'1'],[4,3,'♭3']],
  '7': [[0,0,'1'],[0,4,'3'],[1,-1,'5'],[1,3,'♭7'],[2,0,'1'],[2,2,'3'],[3,0,'5'],[3,1,'♭7'],[4,0,'1'],[4,2,'3']],
  m7b5: [[0,0,'1'],[0,3,'♭3'],[1,-1,'♭5'],[1,3,'♭7'],[2,-1,'1'],[2,2,'♭3'],[3,-1,'♭5'],[3,1,'♭7'],[4,0,'1'],[4,2,'♭3']]
};

function diagram(title: string, subtitle: string, anchor: number, template: ReadonlyArray<readonly [number, number, string]>, frets = 5): Shape {
  const notes = template.map(([string, offset, label]) => ({ string, fret: anchor + offset, label, root: label === '1' }));
  return { title, subtitle, startFret: Math.max(1, Math.min(...notes.map(note => note.fret))), frets, notes };
}
function chordMarkup(value: string) {
  const match = value.match(/^([A-G])([♭♯b#]?)(.*)$/);
  if (!match) return value;
  return <span className="chord-symbol"><span className="chord-root">{match[1]}</span>{match[2] && <sup className="music-accidental">{match[2].replace('b', '♭').replace('#', '♯')}</sup>}{match[3] && <sup className="chord-quality">{match[3]}</sup>}</span>;
}

function ShapeDiagram({ shape }: { shape: Shape }) {
  const strings = ['e', 'B', 'G', 'D', 'A', 'E'];
  const frets = Array.from({ length: shape.frets }, (_, index) => shape.startFret + index);
  return <article className="ah-port-diagram">
    <div className="ah-port-diagram-title"><strong>{shape.title}</strong><small>{shape.subtitle}</small></div>
    <div className="ah-port-neck" aria-label={shape.title}>
      <div className="ah-port-frets"><span></span>{frets.map(fret => <span key={fret}>{fret}</span>)}</div>
      {strings.map((string, stringIndex) => <div className="ah-port-string" key={string}><b>{string}</b>{frets.map(fret => { const note = shape.notes.find(item => item.string === stringIndex && item.fret === fret); return <span key={fret}>{note && <i className={note.root ? 'root' : ''}><small>{note.label}</small></i>}</span>; })}</div>)}
    </div>
  </article>;
}

function HarmonicMap({ form }: { form: FormSection[] }) {
  return <div className="ah-port-form">{form.map(section => <section key={section.name}><header>{section.name}</header><div>{section.bars.map((bar, index) => <article key={`${section.name}-${index}`}>{bar.map(cell => <span key={cell.label}>{chordMarkup(cell.label)}{cell.roman && <small>{cell.roman}</small>}</span>)}</article>)}</div></section>)}</div>;
}

export function AfterHoursPortPreview() {
  const [keyId, setKeyId] = useState('gm-bb');
  const [tab, setTab] = useState<TabId>('chords');
  const key = useMemo(() => studies.find(item => item.id === keyId) ?? studies[0], [keyId]);
  const caged = ['E', 'D', 'C', 'A', 'G'].map((shape, index) => diagram(`CAGED — ${shape}-shape`, `${key.majorKey} scale position`, key.majorRootFret + [0, 2, 5, 7, 9][index], scaleTemplates.major));
  const pentatonics = [0, 3, 5, 7, 10].map((offset, index) => diagram(`Pentatonic — Box ${index + 1}`, `${key.minorKey} / relative-major color`, key.minorRootFret + offset, pentatonicTemplate));
  const arpeggios = key.arpeggios.map(item => diagram(`${item.chord} arpeggio`, 'Chord-tone map', item.anchor, arpeggioTemplates[item.type]));
  const scales = key.scales.map(item => diagram(item.name, item.description, item.anchor, scaleTemplates[item.type]));

  return <article className="ah-port" data-music-context="true">
    <section className="ah-port-hero">
      <span className="eyebrow">Standard № 01 · 1945</span>
      <h1>Autumn Leaves</h1>
      <p className="ah-port-subtitle">Les feuilles mortes</p>
      <p>Composed by Joseph Kosma in 1945 with French lyrics by Jacques Prévert, the tune entered the world as <em>Les feuilles mortes</em> in the ballet <em>Le Rendez-vous</em> and the 1946 film <em>Les Portes de la nuit</em>, sung by Yves Montand. Johnny Mercer wrote the English lyric <em>Autumn Leaves</em> in 1947, and the song crossed into American pop and then jazz, becoming one of the most-played non-American jazz standards.</p>
      <div className="ah-port-standard-select" aria-label="Standards catalog"><button className="active" type="button">Autumn Leaves</button><button type="button" disabled>Ain’t Misbehavin’ · porting next</button><button type="button" disabled>Day and Age · porting next</button></div>
    </section>

    <section className="ah-port-intro-grid">
      <article><span className="eyebrow">Credits</span><dl><div><dt>Music</dt><dd>Joseph Kosma</dd></div><div><dt>Lyrics</dt><dd>Jacques Prévert · Johnny Mercer</dd></div><div><dt>Introduced</dt><dd>1945</dd></div><div><dt>Form</dt><dd>A A′ B C · 32 bars</dd></div></dl></article>
      <article><span className="eyebrow">Why we study it</span><p>Autumn Leaves is the classic teaching vehicle for hearing relative major and relative minor in one form: each eight-bar group moves through a ii–V–I in the major key and a iiø–V7–i in the minor key. Internalizing the form trains your ear for the two most common cadences in jazz at once.</p><small>Notation and tab for the copyrighted melody remain intentionally omitted. This guide focuses on harmony, guitar shapes, and original study material.</small></article>
    </section>

    <section className="ah-port-keybar"><div><span className="eyebrow">Choose a key</span><h2>{key.label}</h2><p>{key.rationale}</p></div><div className="ah-port-segments" role="tablist" aria-label="Autumn Leaves keys">{studies.map(study => <button key={study.id} type="button" role="tab" aria-selected={key.id === study.id} className={key.id === study.id ? 'active' : ''} onClick={() => setKeyId(study.id)}>{study.short}</button>)}</div></section>

    <nav className="ah-port-tabs" aria-label="Autumn Leaves study views">{tabs.map(item => <button key={item.id} type="button" className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>)}</nav>

    <section className="ah-port-view">
      {tab === 'chords' && <div className="ah-port-chords"><div><span className="eyebrow">Study changes / harmonic map</span><HarmonicMap form={key.form} /></div><div><span className="eyebrow">Core voicings</span><div className="ah-port-voicings">{key.voicings.map(voicing => <article key={voicing.chord}><strong>{chordMarkup(voicing.chord)}</strong><small>{voicing.subtitle}</small></article>)}</div></div></div>}
      {tab === 'caged' && <div><span className="eyebrow">CAGED — {key.majorKey} scale</span><p className="ah-port-explainer">Five connected positions of the relative major scale. Anchor each shape to its parent chord form, then connect them up the neck.</p><div className="ah-port-diagram-grid three">{caged.map(shape => <ShapeDiagram key={shape.title} shape={shape} />)}</div></div>}
      {tab === 'pentatonic' && <div><span className="eyebrow">Pentatonic — {key.minorKey}</span><p className="ah-port-explainer">Five boxes covering the neck. For major-key material, read this as the relative-minor pentatonic grid; the same notes give the matching major pentatonic color.</p><div className="ah-port-diagram-grid two">{pentatonics.map(shape => <ShapeDiagram key={shape.title} shape={shape} />)}</div></div>}
      {tab === 'arpeggios' && <div><span className="eyebrow">Arpeggios — chord tones for each change</span><p className="ah-port-explainer">Two-octave arpeggio shapes for the principal chords. Practice them straight, then in eighth-notes through the form.</p><div className="ah-port-diagram-grid two">{arpeggios.map(shape => <ShapeDiagram key={shape.title} shape={shape} />)}</div></div>}
      {tab === 'scales' && <div className="ah-port-scales"><div><span className="eyebrow">Scale shapes</span><div className="ah-port-diagram-grid two">{scales.map(shape => <ShapeDiagram key={shape.title} shape={shape} />)}</div></div><div><span className="eyebrow">Mode map</span><ul>{key.modeNotes.map(note => <li key={note.chord}><div>{chordMarkup(note.chord)}<strong>{note.scale}</strong></div><p>{note.tip}</p></li>)}</ul></div></div>}
    </section>

    <section className="ah-port-etude"><span className="eyebrow">Original study</span><h2>Etude in {key.short}</h2><p>Original 8-bar study over the A-section changes. Use your licensed lead sheet for the copyrighted melody and lyrics.</p><div>{key.form[0].bars.map((bar, index) => <span key={index}>{bar.map(cell => chordMarkup(cell.label))}</span>)}</div></section>

    <section className="ah-port-renditions"><span className="eyebrow">Top renditions — selected for study</span><h2>Three for the headphones</h2><div>
      <article><small>1958 · Somethin’ Else</small><h3>Autumn Leaves</h3><strong>Cannonball Adderley featuring Miles Davis</strong><p>Canonical modern-jazz reference for the Gm/B♭ key. Miles’s spacious theme statement and Adderley’s alto have shaped how the tune is played at sessions for two generations.</p><a href="https://www.milesdavis.com/albums/cannonball-adderley-somethin-else/" target="_blank" rel="noreferrer">Open reference ↗</a></article>
      <article><small>1959 / released 1960 · Portrait in Jazz</small><h3>Autumn Leaves</h3><strong>Bill Evans Trio</strong><p>Listening reference for trio interaction and harmonic clarity. Hear the form as a conversation, not a soloist-and-rhythm hierarchy.</p><a href="https://www.youtube.com/watch?v=r-Z8KuwI7Gc" target="_blank" rel="noreferrer">Open reference ↗</a></article>
      <article><small>2010 · Clapton</small><h3>Autumn Leaves</h3><strong>Eric Clapton</strong><p>A vocal, guitar-forward version that makes the song feel less like a jazz exercise. Study it in <b>B minor</b> using the Bm / D option above.</p></article>
    </div></section>

    <section className="ah-port-sources"><span className="eyebrow">Sources & further reading</span><ul><li><a href="https://www.crj-online.org/v4/CRJ-AutumnLeaves.php" target="_blank" rel="noreferrer">Current Research in Jazz — Autumn Leaves study ↗</a><span>History, key variants, notable recordings, and pedagogical context.</span></li><li><a href="https://www.milesdavis.com/albums/cannonball-adderley-somethin-else/" target="_blank" rel="noreferrer">Cannonball Adderley — Somethin’ Else ↗</a><span>Personnel, session date, and album notes for the 1958 recording.</span></li><li><a href="https://www.youtube.com/watch?v=r-Z8KuwI7Gc" target="_blank" rel="noreferrer">Bill Evans Trio — Portrait in Jazz ↗</a><span>Public listening reference for the trio version.</span></li></ul></section>
  </article>;
}
