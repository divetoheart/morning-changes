import { useMemo, useState } from 'react';
import { FormMap } from './AfterHoursDiagrams';
import { AfterHoursFretboardCustomizer } from './AfterHoursFretboardCustomizer';
import { KeyArrangementReference, StandardFooter, StandardIntro, ThreeForHeadphones } from './AfterHoursStandardSections';
import type { FormSection } from './after-hours-types';

type BluesKey = { id: string; label: string; short: string; root: string; IV: string; V: string; rationale: string; referenceTitle: string; referenceCopy: string; referenceHref: string };
const KEYS: BluesKey[] = [
  {
    id:'g', label:'G blues shapes · G♭ concert', short:'G / G♭ concert', root:'G7', IV:'C7', V:'D7',
    rationale:'The slow-blues language associated with Stevie Ray Vaughan’s Texas Flood: you finger G shapes with the guitar tuned down a half-step, while the band sounds in G♭ concert pitch.',
    referenceTitle:'Stevie Ray Vaughan & Double Trouble · Texas Flood · 1983',
    referenceCopy:'Start here for the default study setting. The recording’s slow space makes the twelve-bar cycle obvious: a phrase, an answer, then room before the next change.',
    referenceHref:'https://www.youtube.com/results?search_query=Stevie+Ray+Vaughan+Texas+Flood+official+audio'
  },
  {
    id:'e', label:'E shuffle', short:'E shuffle', root:'E7', IV:'A7', V:'B7',
    rationale:'A fast Texas-shuffle setting built around the rhythm-guitar language of Pride and Joy. The form is still I–IV–V; only the pulse and attack change.',
    referenceTitle:'Stevie Ray Vaughan & Double Trouble · Pride and Joy · 1983',
    referenceCopy:'Use this setting to study shuffle time before lead playing. The rhythm guitar is the entire engine: bass motion, muted chord chops, and a relentless eighth-note pocket.',
    referenceHref:'https://www.youtube.com/results?search_query=Stevie+Ray+Vaughan+Pride+and+Joy+official+audio'
  },
  {
    id:'a', label:'A blues', short:'A blues', root:'A7', IV:'D7', V:'E7',
    rationale:'A practical guitar key for higher-energy blues vocabulary: double stops, call-and-response, and compact dominant shapes all sit naturally on the neck.',
    referenceTitle:'Cream · Crossroads · Wheels of Fire · 1968',
    referenceCopy:'Use this setting for a faster live-blues reference. The trio moves quickly, but the I–IV–V architecture remains clear underneath the intensity.',
    referenceHref:'https://www.youtube.com/results?search_query=Cream+Crossroads+Wheels+of+Fire+official+audio'
  }
];

function makeForm(key: BluesKey): FormSection[] {
  const bar = (label: string, roman?: string) => [{ label, roman }];
  return [{ name:'12-bar chorus', bars:[bar(key.root,'I7'),bar(key.root,'I7'),bar(key.root,'I7'),bar(key.root,'I7'),bar(key.IV,'IV7'),bar(key.IV,'IV7'),bar(key.root,'I7'),bar(key.root,'I7'),bar(key.V,'V7'),bar(key.IV,'IV7'),bar(key.root,'I7'),bar(key.V,'turnaround')] }];
}
function rootOf(chord: string) { return chord.match(/^([A-G](?:♭|♯|b|#)?)/)?.[1] ?? 'C'; }

export function AfterHoursBluesApp() {
  const [keyId, setKeyId] = useState('g');
  const key = useMemo(() => KEYS.find(item => item.id === keyId) ?? KEYS[0], [keyId]);
  const form = useMemo(() => makeForm(key), [key]);
  const chords = [key.root, key.IV, key.V].map(label => ({ label }));

  return <article className="ah-port ah-piece ah-blues-port" data-music-context="true">
    <StandardIntro
      number="02"
      eyebrow="Blues form"
      title="12-Bar Blues"
      subtitle="The grammar behind a thousand songs"
      lead="Built from the I–IV–V movement, the twelve-bar blues became one of the most durable forms in popular music: flexible enough for slow electric blues, Texas shuffles, hard rock, jazz, and everything in between."
      facts={[{ label:'Harmony', value:'I7 · IV7 · V7' }, { label:'Length', value:'12 bars' }, { label:'Feel', value:'Slow, shuffle, straight' }, { label:'Job', value:'Time before licks' }]}
      why="Every variation still has to make the listener feel the twelve-bar cycle. This guide starts with chord function, dominant guide tones, and room between phrases—not a stack of blues boxes."
      note="Use one recorded reference per day. Listen to the rhythm guitar as hard as you listen to the solo."
    />

    <section className="ah-port-keybar">
      <div>
        <span className="eyebrow">Choose a key</span>
        <h2>{key.label}</h2>
        <p>{key.rationale}</p>
        <KeyArrangementReference title={key.referenceTitle} copy={key.referenceCopy} href={key.referenceHref} linkLabel="Open YouTube listening reference ↗" />
      </div>
      <div className="ah-port-segments" role="tablist" aria-label="12-Bar Blues study settings">{KEYS.map(item => <button type="button" key={item.id} className={item.id === key.id ? 'active' : ''} aria-selected={item.id === key.id} onClick={() => setKeyId(item.id)}>{item.short}</button>)}</div>
    </section>

    <section className="ah-piece-section ah-study-changes">
      <div className="ah-piece-section-head"><div><span className="eyebrow">Study changes</span><h2>One chorus. Twelve bars.</h2><p>Get the architecture under your hands before adding a phrase. A real blues solo can stretch the feel, but it cannot lose the cycle.</p></div></div>
      <FormMap form={form} />
    </section>

    <AfterHoursFretboardCustomizer
      keyLabel={key.short}
      majorRoot={rootOf(key.root)}
      minorRoot={rootOf(key.root)}
      chords={chords}
      cagedLabel={`${rootOf(key.root)} major positions`}
      pentatonicLabel={`${rootOf(key.root)} minor boxes`}
      description="Use the same full neck for every blues layer. CAGED shows the dominant-home framework; pentatonic gives the familiar vocabulary; arpeggio and scale layers follow the active I, IV, or V chord."
    />

    <ThreeForHeadphones
      title="Three blues worlds, one form."
      subtitle="Use these recordings as sound references, not merely history: one slow blues, one high-energy live blues, and one shuffle whose rhythm part carries the entire song."
      picks={[
        { meta:'1983 · Texas Flood', title:'Texas Flood', artist:'Stevie Ray Vaughan & Double Trouble', note:'Slow-blues study. Hear the silence, the held bends, and how each chorus becomes a new sentence while the form stays completely clear.', href:'https://www.youtube.com/results?search_query=Stevie+Ray+Vaughan+Texas+Flood+official+audio', linkLabel:'Open YouTube reference ↗' },
        { meta:'1968 · Wheels of Fire', title:'Crossroads', artist:'Cream', note:'High-energy live blues. Study call-and-response phrasing and how the trio keeps the I–IV–V movement audible under a lot of velocity.', href:'https://www.youtube.com/results?search_query=Cream+Crossroads+Wheels+of+Fire+official+audio', linkLabel:'Open YouTube reference ↗' },
        { meta:'1983 · Texas Flood', title:'Pride and Joy', artist:'Stevie Ray Vaughan & Double Trouble', note:'Texas shuffle study. The rhythm part is the lesson: bass movement, muted chord chops, and a groove that does not collapse when the lead enters.', href:'https://www.youtube.com/results?search_query=Stevie+Ray+Vaughan+Pride+and+Joy+official+audio', linkLabel:'Open YouTube reference ↗' }
      ]}
    />
    <section className="ah-port-sources"><span className="eyebrow">Sources & further reading</span><ul><li><a href="https://en.wikipedia.org/wiki/Texas_Flood" target="_blank" rel="noreferrer">Texas Flood — album and song context ↗</a><span>Release and recording context for Vaughan’s 1983 debut.</span></li><li><a href="https://en.wikipedia.org/wiki/Wheels_of_Fire" target="_blank" rel="noreferrer">Wheels of Fire — Cream ↗</a><span>Album context for Crossroads.</span></li><li><a href="https://en.wikipedia.org/wiki/Live_at_the_El_Mocambo_(Stevie_Ray_Vaughan_video)" target="_blank" rel="noreferrer">Live at the El Mocambo — Stevie Ray Vaughan ↗</a><span>Concert context for a major live Texas Flood reference.</span></li></ul></section>
    <StandardFooter />
  </article>;
}
