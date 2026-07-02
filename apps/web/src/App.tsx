import { useMemo, useState } from 'react';
import { HashRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AfterHoursAutumnLeavesApp } from './AfterHoursAutumnLeavesApp';
import { AfterHoursBluesApp } from './AfterHoursBluesApp';
import { AfterHoursFretboardCustomizer } from './AfterHoursFretboardCustomizer';
import { FretboardChordBuilder } from './FretboardChordBuilder';
import { buildChord, createKey, noteToString, relativeMajorKey, STUDY_KEY_SIGNATURES, type Chord, type ScaleMode, type StudyKeyId, type StudyMode } from './lib/music';
import { useMetronome } from './lib/useMetronome';

type IconName = 'home' | 'paths' | 'after' | 'tools' | 'tempo' | 'arrow';
type NavItem = { to: string; label: string; mobileLabel?: string; detail?: string; icon: IconName; end?: boolean };
type StandardEntry = { title: string; subtitle: string; focus: string; href: string };

const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/fretboard', label: 'Fretboard', icon: 'paths' },
  { to: '/after-hours', label: 'After Hours', mobileLabel: 'After', detail: 'Standards Library', icon: 'after' },
  { to: '/tools', label: 'Tools', icon: 'tools' }
];

const standards: readonly StandardEntry[] = [
  { title: 'Autumn Leaves', subtitle: 'Harmony map, focused ii–V–I studies, shell voicings, and an arpeggio play-along.', focus: 'ii–V–I voice leading and minor cadences', href: '#/after-hours/autumn-leaves' },
  { title: '12-Bar Blues', subtitle: 'Three complete study settings: slow Texas blues, high-energy electric blues, and minor blues.', focus: 'I–IV–V form · three recorded worlds', href: '#/after-hours/12-bar-blues' }
];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'home') return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></svg>;
  if (name === 'paths') return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m15.5 8.5-2.1 5-4.8 2.1 2.1-4.8Z" /></svg>;
  if (name === 'after') return <svg {...common}><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>;
  if (name === 'tools') return <svg {...common}><path d="M4 4v16M20 4v16M4 8h5M15 8h5M4 16h9M17 16h3" /><circle cx="11" cy="8" r="2" /><circle cx="15" cy="16" r="2" /></svg>;
  if (name === 'tempo') return <svg {...common}><path d="M12 3v18" /><path d="M7 7h10M7 17h10" /><path d="M8 7 5 17h14l-3-10" /></svg>;
  return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function AppLayout() {
  const location = useLocation();
  const [tempo, setTempo] = useState(72);
  const metronome = useMetronome(tempo, setTempo);
  const isAfterHours = location.pathname.startsWith('/after-hours');
  const wordmarkTitle = isAfterHours ? 'After Hours' : 'Morning Changes';
  const wordmarkSubtitle = isAfterHours ? 'Standards Library' : 'Daily guitar practice';

  return <div className="app-shell">
    <header className={`app-topbar ${isAfterHours ? 'after-hours-topbar' : ''}`}>
      <NavLink className="wordmark" to="/">
        <span className={`wordmark-mark ${isAfterHours ? 'after-hours-wordmark-mark' : ''}`} aria-hidden="true">{isAfterHours ? '' : '◒'}</span>
        <span><strong>{wordmarkTitle}</strong><small>{wordmarkSubtitle}</small></span>
      </NavLink>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'active' : ''}><span>{item.label}</span>{item.detail && <small>{item.detail}</small>}</NavLink>)}
      </nav>
      <button className="tempo-button" type="button" onClick={metronome.toggle} aria-label={`${metronome.playing ? 'Stop' : 'Start'} metronome at ${metronome.tempo} BPM`}><Icon name="tempo" size={16} /> {metronome.tempo}</button>
    </header>
    <main className="screen">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/fretboard" element={<FretboardScreen />} />
        <Route path="/after-hours" element={<AfterHoursScreen />} />
        <Route path="/after-hours/autumn-leaves" element={<AfterHoursAutumnLeavesApp />} />
        <Route path="/after-hours/12-bar-blues" element={<AfterHoursBluesApp />} />
        <Route path="/tools" element={<ToolsScreen metronome={metronome} />} />
        <Route path="/learn" element={<Navigate replace to="/" />} />
        <Route path="/lesson/:lessonId" element={<Navigate replace to="/" />} />
        <Route path="/practice/:kind/:extraId" element={<Navigate replace to="/" />} />
        <Route path="/paths" element={<Navigate replace to="/fretboard" />} />
        <Route path="/profile" element={<Navigate replace to="/" />} />
        <Route path="/progress" element={<Navigate replace to="/" />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </main>
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {navItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'active' : ''} aria-label={item.label}><Icon name={item.icon} size={19} /><span>{item.mobileLabel ?? item.label}</span></NavLink>)}
    </nav>
  </div>;
}

function ScreenHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <section className="screen-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{copy && <p>{copy}</p>}</section>;
}

function HomeScreen() {
  return <>
    <ScreenHeader eyebrow="Morning Changes" title="Keep the useful parts close." copy="After Hours, the fretboard workspace, and a metronome are the active core while the lesson library is rebuilt properly." />
    <section className="quiet-list core-space-list">
      <span className="list-heading">Core spaces</span>
      <a className="compact-row row-link" href="#/after-hours"><span className="row-icon"><Icon name="after" /></span><span className="row-content"><span className="row-label">Standards library</span><strong>After Hours</strong><small>Apply the tools inside real music: Autumn Leaves, 12-Bar Blues, and what comes next.</small></span><span className="row-action">Open <Icon name="arrow" size={16} /></span></a>
      <a className="compact-row row-link" href="#/fretboard"><span className="row-icon"><Icon name="paths" /></span><span className="row-content"><span className="row-label">Shared music engine</span><strong>Fretboard</strong><small>Build chords, choose a key, then inspect shapes, tones, triads, and voicings.</small></span><span className="row-action">Open <Icon name="arrow" size={16} /></span></a>
      <a className="compact-row row-link" href="#/tools"><span className="row-icon"><Icon name="tools" /></span><span className="row-content"><span className="row-label">Practice utility</span><strong>Tools</strong><small>Set a tempo and keep time without leaving the workspace.</small></span><span className="row-action">Open <Icon name="arrow" size={16} /></span></a>
    </section>
  </>;
}

function FretboardScreen() {
  const [selectedKey, setSelectedKey] = useState<StudyKeyId>('C');
  const [studyMode, setStudyMode] = useState<StudyMode>('major');
  const [activeChord, setActiveChord] = useState<Chord>(() => buildChord('C', 'major7'));
  const scaleMode: ScaleMode = studyMode === 'major' ? 'major' : 'naturalMinor';
  const cagedContext = useMemo(() => studyMode === 'major' ? createKey(selectedKey, 'major') : relativeMajorKey(createKey(selectedKey, 'naturalMinor')), [selectedKey, studyMode]);
  const cagedRoot = noteToString(cagedContext.tonic);
  const cagedLabel = studyMode === 'major' ? `${cagedRoot} major forms` : `${cagedRoot} major · relative major`;
  const keyLabel = `${selectedKey.replace('#', '♯').replace('b', '♭')} ${studyMode === 'major' ? 'major' : 'minor'}`;

  return <>
    <ScreenHeader eyebrow="Fretboard" title="Explore the neck." copy="Choose one of all fifteen key signatures, set major or minor context, then build the chord you want to inspect." />
    <AfterHoursFretboardCustomizer
      key={`${selectedKey}-${studyMode}`}
      keyLabel={keyLabel}
      majorRoot={cagedRoot}
      minorRoot={selectedKey}
      chords={[{ chord: activeChord, scaleMode }]}
      showChordSelector={false}
      studyKeyControls={<StudyKeyControls selectedKey={selectedKey} studyMode={studyMode} onKeyChange={setSelectedKey} onModeChange={setStudyMode} />}
      beforeControls={<FretboardChordBuilder key={`${selectedKey}-${studyMode}`} tonic={selectedKey} studyMode={studyMode} onChordChange={setActiveChord} />}
      description={<>Use the chord builder below for the active chord. CAGED follows {cagedLabel}; Pentatonic follows {selectedKey.replace('#', '♯').replace('b', '♭')} minor; Scale follows the selected study mode.</>}
      cagedLabel={cagedLabel}
      pentatonicLabel={`${selectedKey.replace('#', '♯').replace('b', '♭')} minor boxes`}
    />
  </>;
}

function StudyKeyControls({ selectedKey, studyMode, onKeyChange, onModeChange }: { selectedKey: StudyKeyId; studyMode: StudyMode; onKeyChange: (key: StudyKeyId) => void; onModeChange: (mode: StudyMode) => void }) {
  return <div className="study-key-controls"><label className="key-selector"><span>Key</span><select value={selectedKey} onChange={event => onKeyChange(event.target.value as StudyKeyId)}>{STUDY_KEY_SIGNATURES.map(key => <option key={key.id} value={key.id}>{key.label}</option>)}</select></label><label className="key-selector"><span>Mode</span><select value={studyMode} onChange={event => onModeChange(event.target.value as StudyMode)}><option value="major">Major</option><option value="minor">Minor</option></select></label></div>;
}

function AfterHoursScreen() {
  return <>
    <ScreenHeader eyebrow="After Hours · Standards Library" title="Standards, without the noise." copy="Use real tunes as the place where the fretboard and theory tools become musical." />
    <section className="standard-shelf">
      {standards.map(standard => <article className="standard-row" key={standard.title}><div><span className="eyebrow">{standard.focus}</span><h2>{standard.title}</h2><p>{standard.subtitle}</p><small>Available now</small></div><a className="secondary-button" href={standard.href}>Open <Icon name="arrow" size={16} /></a></article>)}
    </section>
  </>;
}

function ToolsScreen({ metronome }: { metronome: ReturnType<typeof useMetronome> }) {
  return <>
    <ScreenHeader eyebrow="Tools" title="Keep time. Tune up." />
    <section className="metronome-panel"><span className="eyebrow">Metronome</span><div className="tempo-number">{metronome.tempo}</div><span className="tempo-caption">beats per minute · 4/4</span><div className="beat-row">{[0, 1, 2, 3].map(index => <span className={metronome.playing && metronome.beat === index ? 'active' : ''} key={index} />)}</div><input aria-label="Tempo" type="range" min="35" max="240" value={metronome.tempo} onChange={event => metronome.setTempo(Number(event.target.value))} /><div className="metronome-controls"><button className="secondary-button" type="button" onClick={() => metronome.setTempo(metronome.tempo - 1)} aria-label="Decrease tempo">−</button><button className="primary-button" type="button" onClick={metronome.toggle}>{metronome.playing ? 'Stop' : 'Start'} · {metronome.tempo} BPM</button><button className="secondary-button" type="button" onClick={() => metronome.setTempo(metronome.tempo + 1)} aria-label="Increase tempo">+</button><button className="secondary-button" type="button" onClick={metronome.tapTempo}>Tap</button></div></section>
  </>;
}

export default function App() {
  return <HashRouter><AppLayout /></HashRouter>;
}
