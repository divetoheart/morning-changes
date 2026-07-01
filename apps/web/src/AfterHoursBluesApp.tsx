import { useMemo, useState } from 'react';
import { DiagramCard, FormMap, chordMarkup, makeDiagram, makeShellDiagram, voicingsFor } from './AfterHoursDiagrams';
import { ARPEGGIO_PATTERNS, PENTATONIC_BOXES, SCALE_PATTERNS } from './after-hours-shapes';
import { StandardFooter, StandardIntro, ThreeForHeadphones } from './AfterHoursStandardSections';
import type { FormSection } from './after-hours-types';

type BluesKey = { id: string; label: string; short: string; root: string; rootFret: number; IV: string; V: string; rationale: string };
type View = 'form' | 'chords' | 'pentatonic' | 'targets';
const VIEWS: Array<{ id: View; label: string }> = [{ id:'form',label:'Form' }, { id:'chords',label:'Chords' }, { id:'pentatonic',label:'Pentatonic' }, { id:'targets',label:'Targets' }];
const KEYS: BluesKey[] = [
  { id:'g', label:'G blues shapes · Texas Flood', short:'G / G♭ concert', root:'G7', rootFret:3, IV:'C7', V:'D7', rationale:'Texas Flood is a slow 12-bar blues. Stevie Ray Vaughan used G fingering with his guitar tuned down one half-step, sounding in G♭ concert pitch.' },
  { id:'e', label:'E shuffle · Pride and Joy', short:'E shuffle', root:'E7', rootFret:0, IV:'A7', V:'B7', rationale:'A classic fast Texas shuffle canvas. Keep the bass-and-chop pulse alive before adding any lead vocabulary.' },
  { id:'a', label:'A blues · Crossroads language', short:'A blues', root:'A7', rootFret:5, IV:'D7', V:'E7', rationale:'A practical guitar key for high-energy blues phrasing: quick call-and-response, double stops, and a clear I–IV–V map.' }
];

function makeForm(key: BluesKey): FormSection[] {
  const bar = (label: string, roman?: string) => [{ label, roman }];
  return [{ name:'12-bar chorus', bars:[bar(key.root,'I7'),bar(key.root,'I7'),bar(key.root,'I7'),bar(key.root,'I7'),bar(key.IV,'IV7'),bar(key.IV,'IV7'),bar(key.root,'I7'),bar(key.root,'I7'),bar(key.V,'V7'),bar(key.IV,'IV7'),bar(key.root,'I7'),bar(key.V,'turnaround')] }];
}
function parseRoot(chord: string) { return chord.match(/^([A-G](?:♭|♯|b|#)?)/)?.[1] ?? 'C'; }

export function AfterHoursBluesApp() {
  const [keyId, setKeyId] = useState('g');
  const [view, setView] = useState<View>('form');
  const [bar, setBar] = useState(0);
  const key = useMemo(() => KEYS.find(item => item.id === keyId) ?? KEYS[0], [keyId]);
  const form = useMemo(() => makeForm(key), [key]);
  const formLabels = form[0].bars.map(item => item[0].label);
  const current = formLabels[bar];
  const next = formLabels[(bar + 1) % formLabels.length];
  const voicings = voicingsFor(form).map(makeShellDiagram);
  const pentatonics = PENTATONIC_BOXES.map((box, index) => makeDiagram(`Minor Pentatonic — Box ${index + 1}`, `${parseRoot(key.root)} minor pentatonic`, key.rootFret, box));
  const targets = [
    makeDiagram(`${current} dominant arpeggio`, 'Root · 3 · 5 · ♭7', key.rootFret + (current === key.IV ? 5 : current === key.V ? 7 : 0), ARPEGGIO_PATTERNS['7']),
    makeDiagram(`${parseRoot(key.V)} half-whole diminished`, `Tension into ${key.root}`, key.rootFret + (current === key.V ? 7 : 0), SCALE_PATTERNS.halfWhole)
  ];

  return <article className="ah-port ah-blues-port" data-music-context="true">
    <StandardIntro
      number="02"
      eyebrow="Blues form"
      title="12-Bar Blues"
      subtitle="The grammar behind a thousand songs"
      lead="The form is simple enough to learn in one sitting and deep enough to play for life. Get the I–IV–V architecture under your hands, then let recordings teach the feel."
      facts={[{ label:'Harmony', value:'I7 · IV7 · V7' }, { label:'Length', value:'12 bars' }, { label:'Feel', value:'Slow, shuffle, straight' }, { label:'Job', value:'Time before licks' }]}
      why="Every variation still has to make the listener feel the twelve-bar cycle. This guide starts with chord function, dominant guide tones, and room between phrases—not a stack of blues boxes."
      note="Use one recorded reference per day. Listen to the rhythm guitar as hard as you listen to the solo."
    />
    <section className="ah-port-keybar"><div><span className="eyebrow">Choose a study setting</span><h2>{key.label}</h2><p>{key.rationale}</p></div><div className="ah-port-segments" role="tablist">{KEYS.map(item => <button type="button" key={item.id} className={item.id === key.id ? 'active' : ''} onClick={() => { setKeyId(item.id); setBar(0); }}>{item.short}</button>)}</div></section>
    <nav className="ah-port-tabs" aria-label="12-Bar Blues study views">{VIEWS.map(item => <button type="button" key={item.id} className={item.id === view ? 'active' : ''} onClick={() => setView(item.id)}>{item.label}</button>)}</nav>
    <section className="ah-port-view">
      {view === 'form' && <div className="ah-port-chords"><div><span className="eyebrow">One chorus, twelve bars</span><FormMap form={form} /></div><div className="ah-blues-now"><span className="eyebrow">Follow the movement</span><h2>Bar {bar + 1}: {chordMarkup(current)}</h2><p>Do not race the next chord. Name it, hear it, then make the smallest useful move into {chordMarkup(next)}.</p><div>{formLabels.map((label, index) => <button type="button" className={index === bar ? 'active' : ''} key={index} onClick={() => setBar(index)}>{index + 1}</button>)}</div></div></div>}
      {view === 'chords' && <div><span className="eyebrow">Core dominant voicings</span><p className="ah-port-explainer">Compact four-note shells for the selected blues setting. Let the 3rd and ♭7 speak; extra notes can come later.</p><div className="ah-port-voicing-diagrams">{voicings.map(diagram => <DiagramCard key={diagram.title} diagram={diagram} />)}</div></div>}
      {view === 'pentatonic' && <div><span className="eyebrow">Five boxes · {parseRoot(key.root)} minor pentatonic</span><p className="ah-port-explainer">These are five different positions, anchored to the selected root. Use them as neighborhoods, then target a chord tone when the bar changes.</p><div className="ah-port-diagram-grid two">{pentatonics.map(diagram => <DiagramCard key={diagram.title} diagram={diagram} />)}</div></div>}
      {view === 'targets' && <div><span className="eyebrow">Chord targets</span><p className="ah-port-explainer">At each change, land on the 3rd or ♭7 before you reach for a familiar lick. That is what makes the line follow the blues.</p><div className="ah-port-diagram-grid two">{targets.map(diagram => <DiagramCard key={diagram.title} diagram={diagram} />)}</div></div>}
    </section>
    <section className="ah-port-etude"><span className="eyebrow">Play now · original study</span><h2>One chorus. Three rules.</h2><p>Play the root on beat one. Land the 3rd or ♭7 when the chord changes. Leave at least one beat of air after every answer phrase.</p><div>{formLabels.slice(0,8).map((label, index) => <span key={index}>{chordMarkup(label)}</span>)}</div></section>
    <ThreeForHeadphones
      title="Three blues worlds, one form."
      subtitle="Use these recordings as sound references, not merely history: one slow blues, one high-energy live blues, and one shuffle whose rhythm part carries the entire song."
      picks={[
        { meta:'1983 · Texas Flood', title:'Texas Flood', artist:'Stevie Ray Vaughan & Double Trouble', note:'Slow-blues study. Hear the silence, the held bends, and how each chorus becomes a new sentence while the form stays completely clear.', href:'https://en.wikipedia.org/wiki/Texas_Flood_(song)', linkLabel:'Study context ↗' },
        { meta:'1968 · Wheels of Fire', title:'Crossroads', artist:'Cream', note:'High-energy live blues. Study call-and-response phrasing and how the trio keeps the I–IV–V movement audible under a lot of velocity.', href:'https://en.wikipedia.org/wiki/Wheels_of_Fire', linkLabel:'Study context ↗' },
        { meta:'1983 · Texas Flood', title:'Pride and Joy', artist:'Stevie Ray Vaughan & Double Trouble', note:'Texas shuffle study. The rhythm part is the lesson: bass movement, muted chord chops, and a groove that does not collapse when the lead enters.', href:'https://en.wikipedia.org/wiki/Pride_and_Joy_(Stevie_Ray_Vaughan_song)', linkLabel:'Study context ↗' }
      ]}
    />
    <StandardFooter />
  </article>;
}
