import type { StudyKey } from './after-hours-types';
import { StandardFooter, StandardIntro, ThreeForHeadphones } from './AfterHoursStandardSections';
import { FunctionNotation, KeyNotation } from './MusicNotation';
import { createKey } from './lib/music';

const G_MINOR = createKey('G', 'naturalMinor');
const B_FLAT_MAJOR = createKey('B♭', 'major');
const E_MINOR = createKey('E', 'naturalMinor');
const G_MAJOR = createKey('G', 'major');
const B_MINOR = createKey('B', 'naturalMinor');
const D_MAJOR = createKey('D', 'major');

export function AutumnPortIntro() {
  return <StandardIntro
    number="01"
    eyebrow="1945"
    title="Autumn Leaves"
    subtitle="Les feuilles mortes"
    lead={<>Composed by Joseph Kosma in 1945 with French lyrics by Jacques Prévert, the tune entered the world as <em>Les feuilles mortes</em>. Johnny Mercer’s 1947 English lyric carried it into American popular music and then into the jazz-standard canon.</>}
    facts={[{ label:'Music', value:'Joseph Kosma' }, { label:'Lyrics', value:'Prévert · Mercer' }, { label:'Introduced', value:'1945' }, { label:'Form', value:'A A′ B C · 32 bars' }]}
    why={<>Autumn Leaves is the classic vehicle for hearing relative major and relative minor in one form: each eight-bar group carries a major <FunctionNotation functional={{ degree:'ii', quality:'minor7', context:'major' }} />–<FunctionNotation functional={{ degree:'V', quality:'dominant7', context:'major' }} />–<FunctionNotation functional={{ degree:'I', quality:'major7', context:'major' }} />–<FunctionNotation functional={{ degree:'IV', quality:'major7', context:'major' }} /> thought and a minor <FunctionNotation functional={{ degree:'ii', quality:'halfDiminished7', context:'minor' }} />–<FunctionNotation functional={{ degree:'V', quality:'dominant7', context:'minor' }} />–<FunctionNotation functional={{ degree:'i', quality:'minor', context:'minor' }} /> thought.</>}
    note="Notation and tab for the copyrighted melody remain omitted. This guide is harmony, guitar-shape, and original-study material."
  />;
}

export function AutumnPortFooter({ study: _study, onSwitchKey }: { study: StudyKey; onSwitchKey: (keyId: string) => void }) {
  return <>
    <ThreeForHeadphones
      title="Three versions, three ways to hear the form."
      subtitle="Start with the melody, then listen for space, time feel, and how each version keeps the harmony audible without sounding like an exercise."
      picks={[
        { meta:'1958 · Somethin’ Else', title:'Autumn Leaves', artist:'Cannonball Adderley featuring Miles Davis', note:<>The <KeyNotation context={G_MINOR} /> / <KeyNotation context={B_FLAT_MAJOR} /> modern-jazz reference: Miles’s spacious statement, Adderley’s alto, and a lesson in playing the form without crowding it.</>, href:'https://www.youtube.com/watch?v=u37RF5xKNq8', keyLabel:<><KeyNotation context={G_MINOR} /> / <KeyNotation context={B_FLAT_MAJOR} /></>, onSwitchKey:() => onSwitchKey('gm-bb') },
        { meta:'1959 / released 1960 · Portrait in Jazz', title:'Autumn Leaves', artist:'Bill Evans Trio', note:<>A trio reference for conversation, comping space, and a rhythm section that moves as one line. The linked <KeyNotation context={E_MINOR} /> / <KeyNotation context={G_MAJOR} /> study is a guitar-friendly translation of that listening world.</>, href:'https://www.youtube.com/watch?v=r-Z8KuwI7Gc', keyLabel:<><KeyNotation context={E_MINOR} /> / <KeyNotation context={G_MAJOR} /></>, onSwitchKey:() => onSwitchKey('em-g') },
        { meta:'2010 · Clapton', title:'Autumn Leaves', artist:'Eric Clapton', note:<>A vocal, guitar-forward reading from Clapton’s 2010 album. The <KeyNotation context={B_MINOR} /> / <KeyNotation context={D_MAJOR} /> option is the dedicated guitar study key for this reference.</>, href:'https://www.youtube.com/results?search_query=Eric+Clapton+Autumn+Leaves+Clapton+2010', keyLabel:<><KeyNotation context={B_MINOR} /> / <KeyNotation context={D_MAJOR} /></>, onSwitchKey:() => onSwitchKey('bm-d') }
      ]}
    />
    <section className="ah-port-sources"><span className="eyebrow">Sources & further reading</span><ul><li><a href="https://www.crj-online.org/v4/CRJ-AutumnLeaves.php" target="_blank" rel="noreferrer">Current Research in Jazz — Autumn Leaves study ↗</a><span>History, key variants, recordings, and pedagogical context.</span></li><li><a href="https://en.wikipedia.org/wiki/Somethin%27_Else_(Cannonball_Adderley_album)" target="_blank" rel="noreferrer">Somethin’ Else — recording context ↗</a><span>Personnel and 1958 session context for the canonical version.</span></li><li><a href="https://en.wikipedia.org/wiki/Portrait_in_Jazz" target="_blank" rel="noreferrer">Portrait in Jazz — Bill Evans Trio ↗</a><span>Session context for the 1959 trio recording.</span></li><li><a href="https://en.wikipedia.org/wiki/Clapton_(2010_album)" target="_blank" rel="noreferrer">Eric Clapton — Clapton (2010) ↗</a><span>Album context for Clapton’s version.</span></li></ul></section>
    <StandardFooter />
  </>;
}
