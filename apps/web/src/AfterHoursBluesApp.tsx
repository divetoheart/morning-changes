import { useMemo, useState } from 'react';
import { FormMap } from './AfterHoursDiagrams';
import { AfterHoursFretboardCustomizer } from './AfterHoursFretboardCustomizer';
import { KeyArrangementReference, StandardFooter, StandardIntro, ThreeForHeadphones } from './AfterHoursStandardSections';
import type { FormSection } from './after-hours-types';
import type { FunctionalChord } from './lib/music';

type BluesKey = {
  id: string;
  label: string;
  short: string;
  root: string;
  IV: string;
  V: string;
  majorRoot: string;
  minorRoot: string;
  minor?: boolean;
  rationale: string;
  referenceTitle: string;
  referenceCopy: string;
  referenceHref: string;
};
const KEYS: BluesKey[] = [
  {
    id:'g', label:'G blues shapes · G♭ concert', short:'G / G♭ concert', root:'G7', IV:'C7', V:'D7', majorRoot:'G', minorRoot:'G',
    rationale:'The slow-blues language associated with Stevie Ray Vaughan’s Texas Flood: you finger G shapes with the guitar tuned down a half-step, while the band sounds in G♭ concert pitch.',
    referenceTitle:'Stevie Ray Vaughan & Double Trouble · Texas Flood · 1983',
    referenceCopy:'Start here for the default study setting. The recording’s slow space makes the twelve-bar cycle obvious: a phrase, an answer, then room before the next change.',
    referenceHref:'https://www.youtube.com/results?search_query=Stevie+Ray+Vaughan+Texas+Flood+official+audio'
  },
  {
    id:'a', label:'A blues', short:'A blues', root:'A7', IV:'D7', V:'E7', majorRoot:'A', minorRoot:'A',
    rationale:'A practical guitar key for higher-energy blues vocabulary: double stops, call-and-response, and compact dominant shapes all sit naturally on the neck.',
    referenceTitle:'Cream · Crossroads · Wheels of Fire · 1968',
    referenceCopy:'Use this setting for a faster live-blues reference. The trio moves quickly, but the I–IV–V architecture remains clear underneath the intensity.',
    referenceHref:'https://www.youtube.com/results?search_query=Cream+Crossroads+Wheels+of+Fire+official+audio'
  },
  {
    id:'bm', label:'B minor blues', short:'B minor', root:'Bm7', IV:'Em7', V:'F♯7', majorRoot:'D', minorRoot:'B', minor:true,
    rationale:'A minor-key twelve-bar route built around B.B. King’s The Thrill Is Gone. It opens a different guitar vocabulary: long vocal phrases, B minor pentatonic, and a clear dominant pull from F♯7 back into B minor.',
    referenceTitle:'B.B. King · The Thrill Is Gone · Completely Well · 1969',
    referenceCopy:'Use this setting for slow minor blues. B.B. King makes the space between phrases part of the melody; the B minor pentatonic is only the beginning of the sound.',
    referenceHref:'https://www.youtube.com/results?search_query=B.B.+King+The+Thrill+Is+Gone+official+audio'
  }
];

const majorI = { degree: 'I', quality: 'dominant7', context: 'major' } satisfies FunctionalChord;
const majorIV = { degree: 'IV', quality: 'dominant7', context: 'major' } satisfies FunctionalChord;
const majorV = { degree: 'V', quality: 'dominant7', context: 'major' } satisfies FunctionalChord;
const minorI = { degree: 'i', quality: 'minor7', context: 'minor' } satisfies FunctionalChord;
const minorIV = { degree: 'iv', quality: 'minor7', context: 'minor' } satisfies FunctionalChord;
const minorV = { degree: 'V', quality: 'dominant7', context: 'minor' } satisfies FunctionalChord;

function makeForm(key: BluesKey): FormSection[] {
  const bar = (label: string, functional: FunctionalChord) => [{ label, function: functional }];
  if (key.minor) return [{ name:'12-bar minor blues', bars:[bar(key.root, minorI),bar(key.root, minorI),bar(key.root, minorI),bar(key.root, minorI),bar(key.IV, minorIV),bar(key.IV, minorIV),bar(key.root, minorI),bar(key.root, minorI),bar(key.V, minorV),bar(key.IV, minorIV),bar(key.root, minorI),bar(key.V, minorV)] }];
  return [{ name:'12-bar chorus', bars:[bar(key.root, majorI),bar(key.root, majorI),bar(key.root, majorI),bar(key.root, majorI),bar(key.IV, majorIV),bar(key.IV, majorIV),bar(key.root, majorI),bar(key.root, majorI),bar(key.V, majorV),bar(key.IV, majorIV),bar(key.root, majorI),bar(key.V, majorV)] }];
}

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
      lead="Built from I–IV–V movement, the twelve-bar blues became one of the most durable forms in popular music: flexible enough for slow electric blues, Texas shuffles, hard rock, jazz, and the minor-blues language of players like B.B. King."
      facts={[{ label:'Harmony', value:'I7 · IV7 · V7 / minor variant' }, { label:'Length', value:'12 bars' }, { label:'Feel', value:'Slow, shuffle, straight' }, { label:'Job', value:'Time before licks' }]}
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
      majorRoot={key.majorRoot}
      minorRoot={key.minorRoot}
      chords={chords}
      cagedLabel={`${key.majorRoot} major positions`}
      pentatonicLabel={`${key.minorRoot} minor boxes`}
      description="Use the same full neck for every blues layer. CAGED shows the home framework; pentatonic gives the familiar vocabulary; arpeggio and scale layers follow the active I, IV, or V chord."
    />
    <ThreeForHeadphones
      title="Three blues worlds, one form."
      subtitle="Use these recordings as sound references, not merely history: one slow electric blues, one high-energy live blues, and one minor-blues masterclass in melody and space."
      picks={[
        { meta:'1983 · Texas Flood', title:'Texas Flood', artist:'Stevie Ray Vaughan & Double Trouble', note:'Slow-blues study. Hear the silence, the held bends, and how each chorus becomes a new sentence while the form stays completely clear.', href:'https://www.youtube.com/results?search_query=Stevie+Ray+Vaughan+Texas+Flood+official+audio', keyLabel:'G / G♭ concert', onSwitchKey:() => setKeyId('g') },
        { meta:'1968 · Wheels of Fire', title:'Crossroads', artist:'Cream', note:'High-energy live blues. Study call-and-response phrasing and how the trio keeps the I–IV–V movement audible under a lot of velocity.', href:'https://www.youtube.com/results?search_query=Cream+Crossroads+Wheels+of+Fire+official+audio', keyLabel:'A blues', onSwitchKey:() => setKeyId('a') },
        { meta:'1969 · Completely Well', title:'The Thrill Is Gone', artist:'B.B. King', note:'A slow B minor twelve-bar blues and a masterclass in vocal phrasing, heavy vibrato, and leaving the perfect amount of air after a note.', href:'https://www.youtube.com/results?search_query=B.B.+King+The+Thrill+Is_Gone+official+audio', keyLabel:'B minor', onSwitchKey:() => setKeyId('bm') }
      ]}
    />
    <section className="ah-port-sources"><span className="eyebrow">Sources & further reading</span><ul><li><a href="https://en.wikipedia.org/wiki/Texas_Flood" target="_blank" rel="noreferrer">Texas Flood — album and song context ↗</a><span>Release and recording context for Vaughan’s 1983 debut.</span></li><li><a href="https://en.wikipedia.org/wiki/Wheels_of_Fire" target="_blank" rel="noreferrer">Wheels of Fire — Cream ↗</a><span>Album context for Crossroads.</span></li><li><a href="https://en.wikipedia.org/wiki/The_Thrill_Is_Gone" target="_blank" rel="noreferrer">The Thrill Is Gone — B.B. King ↗</a><span>Song history and B.B. King’s 1969 recording context.</span></li></ul></section>
    <StandardFooter />
  </article>;
}
