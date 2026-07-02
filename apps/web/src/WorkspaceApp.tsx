import { useEffect, useMemo, useRef, useState } from 'react';
import { HashRouter, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AfterHoursAutumnPort } from './AfterHoursAutumnPort';
import { AfterHoursBluesApp } from './AfterHoursBluesApp';
import { FretboardMap } from './AfterHoursFretboardCustomizer';
import { ChordNotation, KeyNotation } from './MusicNotation';
import { evaluateMusicEngineContract } from './lib/music/contract';
import { buildChord, createKey, type ChordQuality, type ScaleMode } from './lib/music';

const STORAGE_KEY = 'morning-changes.workspace.v1';

type ExplorerView = 'layers' | 'roots';
type FretboardSetup = {
  keyRoot: string;
  chordRoot: string;
  chordQuality: ChordQuality;
  scaleMode: ScaleMode;
  view: ExplorerView;
};

type WorkspaceState = {
  fretboard: FretboardSetup;
  recentStandard?: 'autumn-leaves' | '12-bar-blues';
  updatedAt?: string;
};

const ROOTS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'] as const;
const SCALE_MODES: Array<{ value: ScaleMode; label: string }> = [
  { value: 'major', label: 'Major' },
  { value: 'naturalMinor', label: 'Natural minor' },
  { value: 'harmonicMinor', label: 'Harmonic minor' },
  { value: 'melodicMinor', label: 'Melodic minor' },
  { value: 'dorian', label: 'Dorian' },
  { value: 'phrygian', label: 'Phrygian' },
  { value: 'lydian', label: 'Lydian' },
  { value: 'mixolydian', label: 'Mixolydian' },
  { value: 'locrian', label: 'Locrian' }
];
const CHORD_QUALITIES: Array<{ value: ChordQuality; label: string }> = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'dominant7', label: 'Dominant 7' },
  { value: 'major7', label: 'Major 7' },
  { value: 'minor7', label: 'Minor 7' },
  { value: 'halfDiminished7', label: 'Half diminished' },
  { value: 'diminished', label: 'Diminished' },
  { value: 'diminished7', label: 'Diminished 7' },
  { value: 'augmented', label: 'Augmented' },
  { value: 'sus2', label: 'Sus2' },
  { value: 'sus4', label: 'Sus4' }
];

const DEFAULT_SETUP: FretboardSetup = {
  keyRoot: 'C',
  chordRoot: 'C',
  chordQuality: 'major7',
  scaleMode: 'major',
  view: 'layers'
};

function loadWorkspaceState(): WorkspaceState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { fretboard: DEFAULT_SETUP };
    const stored = JSON.parse(raw) as Partial<WorkspaceState>;
    const fretboard = { ...DEFAULT_SETUP, ...(stored.fretboard ?? {}) };
    if (!ROOTS.includes(fretboard.keyRoot as (typeof ROOTS)[number])) return { fretboard: DEFAULT_SETUP };
    if (!ROOTS.includes(fretboard.chordRoot as (typeof ROOTS)[number])) return { fretboard: DEFAULT_SETUP };
    if (!SCALE_MODES.some(mode => mode.value === fretboard.scaleMode)) return { fretboard: DEFAULT_SETUP };
    if (!CHORD_QUALITIES.some(quality => quality.value === fretboard.chordQuality)) return { fretboard: DEFAULT_SETUP };
    if (fretboard.view !== 'layers' && fretboard.view !== 'roots') return { fretboard: DEFAULT_SETUP };
    return { fretboard, recentStandard: stored.recentStandard, updatedAt: stored.updatedAt };
  } catch {
    return { fretboard: DEFAULT_SETUP };
  }
}

function modeLabel(mode: ScaleMode) {
  return SCALE_MODES.find(item => item.value === mode)?.label ?? mode;
}

function qualityLabel(quality: ChordQuality) {
  return CHORD_QUALITIES.find(item => item.value === quality)?.label ?? quality;
}

function AppShell() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(loadWorkspaceState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [workspace]);

  const setFretboard = (fretboard: FretboardSetup) => {
    setWorkspace(previous => ({ ...previous, fretboard, updatedAt: new Date().toISOString() }));
  };
  const setRecentStandard = (recentStandard: WorkspaceState['recentStandard']) => {
    setWorkspace(previous => ({ ...previous, recentStandard, updatedAt: new Date().toISOString() }));
  };
  const resetWorkspace = () => setWorkspace({ fretboard: DEFAULT_SETUP });

  return <div className="workspace-app">
    <header className="workspace-topbar">
      <NavLink className="workspace-brand" to="/" aria-label="Morning Changes home">
        <span className="workspace-brand-mark">M</span>
        <span><strong>Morning Changes</strong><small>guitar workspace</small></span>
      </NavLink>
      <nav className="workspace-nav" aria-label="Primary navigation">
        <NavItem to="/">Home</NavItem>
        <NavItem to="/learn">Learn</NavItem>
        <NavItem to="/after-hours">After Hours</NavItem>
        <NavItem to="/fretboard">Fretboard</NavItem>
        <NavItem to="/tools">Tools</NavItem>
        <NavItem to="/profile">Profile</NavItem>
      </nav>
    </header>

    <main className="workspace-main">
      <Routes>
        <Route path="/" element={<HomePage workspace={workspace} />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/after-hours" element={<AfterHoursCatalog onOpen={setRecentStandard} />} />
        <Route path="/after-hours/autumn-leaves" element={<StandardFrame label="After Hours · Standard 01"><AfterHoursAutumnPort /></StandardFrame>} />
        <Route path="/after-hours/12-bar-blues" element={<StandardFrame label="After Hours · Standard 02"><AfterHoursBluesApp /></StandardFrame>} />
        <Route path="/fretboard" element={<FretboardExplorer setup={workspace.fretboard} onChange={setFretboard} />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/profile" element={<ProfilePage workspace={workspace} onReset={resetWorkspace} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>

    <nav className="workspace-bottom-nav" aria-label="Primary navigation">
      <NavItem to="/">Home</NavItem>
      <NavItem to="/after-hours">After Hours</NavItem>
      <NavItem to="/fretboard">Fretboard</NavItem>
      <NavItem to="/tools">Tools</NavItem>
      <NavItem to="/profile">Profile</NavItem>
    </nav>
  </div>;
}

function NavItem({ to, children }: { to: string; children: string }) {
  return <NavLink end={to === '/'} to={to} className={({ isActive }) => isActive ? 'active' : undefined}>{children}</NavLink>;
}

function PageHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <header className="workspace-page-header"><span className="workspace-eyebrow">{eyebrow}</span><h1>{title}</h1>{copy && <p>{copy}</p>}</header>;
}

function HomePage({ workspace }: { workspace: WorkspaceState }) {
  const navigate = useNavigate();
  const selectedChord = buildChord(workspace.fretboard.chordRoot, workspace.fretboard.chordQuality);
  const recentLabel = workspace.recentStandard === 'autumn-leaves' ? 'Autumn Leaves' : workspace.recentStandard === '12-bar-blues' ? '12-Bar Blues' : null;

  return <section className="workspace-page workspace-home">
    <PageHeader eyebrow="Morning Changes" title="A clear place to play." copy="Explore the neck, study a tune, or keep time. Nothing is asking you to keep up." />
    <section className="workspace-hero-card">
      <div><span className="workspace-eyebrow">Start here</span><h2>What are you working on?</h2><p>Use the fretboard when you want a visual answer. Open After Hours when you want to hear the idea inside music.</p></div>
      <div className="workspace-hero-actions">
        <button type="button" className="workspace-primary" onClick={() => navigate('/fretboard')}>Explore the fretboard</button>
        <button type="button" className="workspace-secondary" onClick={() => navigate('/after-hours')}>Study a standard</button>
        <button type="button" className="workspace-secondary" onClick={() => navigate('/tools')}>Open tools</button>
      </div>
    </section>
    <section className="workspace-section">
      <div className="workspace-section-heading"><span className="workspace-eyebrow">Continue</span><h2>Right where you left it.</h2></div>
      <div className="workspace-continue-grid">
        <button type="button" className="workspace-continue-card" onClick={() => navigate('/fretboard')}>
          <span className="workspace-card-kicker">Fretboard Explorer</span>
          <strong><ChordNotation chord={selectedChord} /> · {modeLabel(workspace.fretboard.scaleMode)}</strong>
          <small>{workspace.fretboard.view === 'roots' ? 'Root map' : 'Layers and positions'} · reopen setup</small>
        </button>
        <button type="button" className="workspace-continue-card" onClick={() => navigate('/after-hours')}>
          <span className="workspace-card-kicker">After Hours</span>
          <strong>{recentLabel ?? 'Choose a standard'}</strong>
          <small>{recentLabel ? 'Return to the last study space' : 'Autumn Leaves and 12-Bar Blues are ready.'}</small>
        </button>
      </div>
    </section>
    <section className="workspace-section">
      <div className="workspace-section-heading"><span className="workspace-eyebrow">Quick starts</span><h2>Go straight to music.</h2></div>
      <div className="workspace-quick-grid">
        <QuickStart title="Autumn Leaves" copy="Harmony, form, listening, and the whole neck." onClick={() => navigate('/after-hours/autumn-leaves')} />
        <QuickStart title="12-Bar Blues" copy="I–IV–V form, dominant language, and slow-blues space." onClick={() => navigate('/after-hours/12-bar-blues')} />
        <QuickStart title="Fretboard Explorer" copy="Choose a key, chord, scale, and shape layer." onClick={() => navigate('/fretboard')} />
        <QuickStart title="Metronome" copy="Set a tempo, tap it in, and leave the clutter behind." onClick={() => navigate('/tools')} />
      </div>
    </section>
    <section className="workspace-note-card"><span className="workspace-eyebrow">Learn</span><p>Structured lessons are being rebuilt around the visual tools that work here. The components come first; the curriculum comes after.</p><button className="workspace-inline-link" type="button" onClick={() => navigate('/learn')}>See the rebuild plan →</button></section>
  </section>;
}

function QuickStart({ title, copy, onClick }: { title: string; copy: string; onClick: () => void }) {
  return <button type="button" className="workspace-quick-card" onClick={onClick}><strong>{title}</strong><small>{copy}</small><span>Open →</span></button>;
}

function LearnPage() {
  const roadmap = ['Roots and intervals', 'Triads and chord tones', 'Guide tones and voice leading', 'Standards application'];
  return <section className="workspace-page workspace-learn">
    <PageHeader eyebrow="Learn" title="Built after the tools." copy="The old lesson system is out of the way. Lessons will return when each one can use a polished visual and a real musical interaction." />
    <section className="workspace-empty-state"><span className="workspace-eyebrow">In rebuild</span><h2>No filler curriculum.</h2><p>For now, use After Hours for actual music and the Fretboard Explorer for hands-on study. The next lessons will be composed from those finished pieces instead of asking legacy pages to pretend they are done.</p><ol>{roadmap.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol></section>
  </section>;
}

function AfterHoursCatalog({ onOpen }: { onOpen: (standard: WorkspaceState['recentStandard']) => void }) {
  const navigate = useNavigate();
  const open = (standard: NonNullable<WorkspaceState['recentStandard']>) => {
    onOpen(standard);
    navigate(standard === 'autumn-leaves' ? '/after-hours/autumn-leaves' : '/after-hours/12-bar-blues');
  };
  return <section className="workspace-page workspace-after-hours">
    <PageHeader eyebrow="After Hours · Standards Library" title="Music, not exercises." copy="Each study is a place to hear harmony, see it on the neck, and keep returning to the tune." />
    <div className="workspace-standard-grid">
      <article className="workspace-standard-card"><span className="workspace-card-kicker">Standard 01 · available</span><h2>Autumn Leaves</h2><p>Major and minor cadences, form awareness, arpeggio connection, and a full-neck study space in three useful key centers.</p><button type="button" className="workspace-primary" onClick={() => open('autumn-leaves')}>Open Autumn Leaves</button></article>
      <article className="workspace-standard-card"><span className="workspace-card-kicker">Standard 02 · available</span><h2>12-Bar Blues</h2><p>One durable form. Explore dominant movement, minor blues, phrasing space, and the guitar shapes that make the cycle audible.</p><button type="button" className="workspace-primary" onClick={() => open('12-bar-blues')}>Open 12-Bar Blues</button></article>
    </div>
  </section>;
}

function StandardFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return <section className="workspace-standard-frame"><div className="workspace-standard-back"><NavLink to="/after-hours">← {label}</NavLink></div>{children}</section>;
}

function FretboardExplorer({ setup, onChange }: { setup: FretboardSetup; onChange: (setup: FretboardSetup) => void }) {
  const chord = useMemo(() => buildChord(setup.chordRoot, setup.chordQuality), [setup.chordRoot, setup.chordQuality]);
  const key = useMemo(() => createKey(setup.keyRoot, setup.scaleMode), [setup.keyRoot, setup.scaleMode]);
  const update = <K extends keyof FretboardSetup>(field: K, value: FretboardSetup[K]) => onChange({ ...setup, [field]: value });
  const isRootMap = setup.view === 'roots';

  return <section className="workspace-page workspace-fretboard">
    <PageHeader eyebrow="Fretboard Explorer" title="One neck. Your context." copy="Pick a key and a chord, then turn on only the information you want. Every marker remains inspectable when shapes overlap." />
    <section className="workspace-explorer-controls" aria-label="Fretboard controls">
      <label><span>Study key</span><select value={setup.keyRoot} onChange={event => update('keyRoot', event.target.value)}>{ROOTS.map(root => <option key={root} value={root}>{root}</option>)}</select></label>
      <label><span>Scale / mode</span><select value={setup.scaleMode} onChange={event => update('scaleMode', event.target.value as ScaleMode)}>{SCALE_MODES.map(mode => <option key={mode.value} value={mode.value}>{mode.label}</option>)}</select></label>
      <label><span>Chord root</span><select value={setup.chordRoot} onChange={event => update('chordRoot', event.target.value)}>{ROOTS.map(root => <option key={root} value={root}>{root}</option>)}</select></label>
      <label><span>Chord quality</span><select value={setup.chordQuality} onChange={event => update('chordQuality', event.target.value as ChordQuality)}>{CHORD_QUALITIES.map(quality => <option key={quality.value} value={quality.value}>{quality.label}</option>)}</select></label>
      <fieldset className="workspace-view-toggle"><legend>View</legend><button type="button" className={setup.view === 'layers' ? 'active' : ''} aria-pressed={setup.view === 'layers'} onClick={() => update('view', 'layers')}>Layers</button><button type="button" className={setup.view === 'roots' ? 'active' : ''} aria-pressed={setup.view === 'roots'} onClick={() => update('view', 'roots')}>Roots</button></fieldset>
    </section>
    <section className="workspace-explorer-summary">
      <div><span className="workspace-card-kicker">Current context</span><strong><KeyNotation context={key} /> · <ChordNotation chord={chord} /></strong><small>{isRootMap ? 'Root map shows every selected chord root across frets 0–15.' : 'Use the controls below the neck to toggle CAGED, pentatonic, arpeggio, and scale layers.'}</small></div>
      <button type="button" className="workspace-secondary" onClick={() => onChange({ ...DEFAULT_SETUP, keyRoot: setup.keyRoot, chordRoot: setup.keyRoot })}>Reset explorer</button>
    </section>
    <FretboardMap
      key={`${setup.keyRoot}-${setup.chordRoot}-${setup.chordQuality}-${setup.scaleMode}-${setup.view}`}
      keyLabel={<><KeyNotation context={key} /></>}
      majorRoot={setup.chordRoot}
      minorRoot={setup.chordRoot}
      chords={[{ chord, scaleMode: setup.scaleMode }]}
      description={isRootMap ? <>Every marker is the root of <ChordNotation chord={chord} />. Change the selected chord root to relocate the map.</> : <>CAGED and minor pentatonic are organized around <ChordNotation chord={buildChord(setup.chordRoot, 'major')} /> / {setup.chordRoot} minor. Arpeggio and scale layers follow the selected chord and {modeLabel(setup.scaleMode)} context.</>}
      cagedLabel={`${setup.chordRoot} major positions`}
      pentatonicLabel={`${setup.chordRoot} minor boxes`}
      mode={isRootMap ? 'roots' : 'layers'}
      eyebrow={isRootMap ? 'Root map' : 'Shapes and positions'}
      heading={isRootMap ? 'Find the selected root across the neck.' : 'Stack only the maps you need.'}
    />
    <section className="workspace-explorer-note"><span className="workspace-eyebrow">How this explorer reads</span><p>Arpeggio owns the visible interval whenever layers disagree. The ring preserves every other membership, and tapping a marker opens the full role list. This keeps the neck honest instead of piling competing numbers on one fret.</p></section>
  </section>;
}

function ToolsPage() {
  const [tempo, setTempo] = useState(72);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  const timer = useRef<number | null>(null);

  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
    setBeat(0);
  };
  const tick = (accent = false) => {
    const Context = window.AudioContext ?? window.webkitAudioContext;
    if (!Context) return;
    audioContext.current ??= new Context();
    const context = audioContext.current;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = accent ? 1200 : 880;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.045);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.055);
  };
  const start = () => {
    stop();
    let nextBeat = 0;
    tick(true);
    setBeat(0);
    timer.current = window.setInterval(() => {
      nextBeat = (nextBeat + 1) % 4;
      setBeat(nextBeat);
      tick(nextBeat === 0);
    }, Math.max(120, Math.round(60000 / tempo)));
    setPlaying(true);
  };
  useEffect(() => () => { if (timer.current !== null) window.clearInterval(timer.current); }, []);
  useEffect(() => { if (playing) start(); }, [tempo]);

  const contract = evaluateMusicEngineContract();
  return <section className="workspace-page workspace-tools">
    <PageHeader eyebrow="Tools" title="Keep time. Check the system." copy="Utilities stay small and honest. If something is not working yet, it does not pretend otherwise." />
    <section className="workspace-tool-card"><div><span className="workspace-eyebrow">Metronome</span><h2>{tempo}<small> BPM</small></h2><p>4/4 · beat {beat + 1}</p><div className="workspace-beats">{[0, 1, 2, 3].map(index => <span key={index} className={playing && beat === index ? 'active' : ''} />)}</div></div><div className="workspace-metronome-controls"><input aria-label="Tempo" type="range" min="35" max="240" value={tempo} onChange={event => setTempo(Number(event.target.value))} /><div><button className="workspace-secondary" type="button" onClick={() => setTempo(value => Math.max(35, value - 1))}>−</button><button className="workspace-primary" type="button" onClick={() => playing ? stop() : start()}>{playing ? 'Stop' : 'Start'} · {tempo} BPM</button><button className="workspace-secondary" type="button" onClick={() => setTempo(value => Math.min(240, value + 1))}>+</button></div></div></section>
    <section className="workspace-tool-card workspace-contract-card"><div><span className="workspace-eyebrow">Music engine contract</span><h2>{contract.passed ? 'All checks pass.' : 'Check failures found.'}</h2><p>{contract.cases.length} spelling, geometry, collision, and voicing checks are running behind the workspace.</p></div><span className={contract.passed ? 'workspace-status pass' : 'workspace-status fail'}>{contract.passed ? 'Passing' : `${contract.cases.filter(test => !test.passed).length} failing`}</span></section>
    <section className="workspace-empty-tool"><span className="workspace-card-kicker">Planned utility</span><strong>Chromatic tuner</strong><small>Pitch detection is not in this rebuild yet, so it stays clearly marked as planned.</small></section>
  </section>;
}

function ProfilePage({ workspace, onReset }: { workspace: WorkspaceState; onReset: () => void }) {
  const navigate = useNavigate();
  const chord = buildChord(workspace.fretboard.chordRoot, workspace.fretboard.chordQuality);
  const key = createKey(workspace.fretboard.keyRoot, workspace.fretboard.scaleMode);
  const lastUpdated = workspace.updatedAt ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(workspace.updatedAt)) : 'Not saved yet';
  const recentStandard = workspace.recentStandard === 'autumn-leaves' ? 'Autumn Leaves' : workspace.recentStandard === '12-bar-blues' ? '12-Bar Blues' : 'No standard opened yet';
  return <section className="workspace-page workspace-profile">
    <PageHeader eyebrow="Profile" title="Your musical workspace." copy="This is useful state, not a scoreboard. Keep a few places you can return to." />
    <section className="workspace-profile-grid">
      <article><span className="workspace-card-kicker">Saved fretboard setup</span><strong><KeyNotation context={key} /> · <ChordNotation chord={chord} /></strong><small>{workspace.fretboard.view === 'roots' ? 'Root map' : 'Layer map'} · saved {lastUpdated}</small><button type="button" className="workspace-inline-link" onClick={() => navigate('/fretboard')}>Open explorer →</button></article>
      <article><span className="workspace-card-kicker">Recent standard</span><strong>{recentStandard}</strong><small>{workspace.recentStandard ? 'The next visit to After Hours begins from the catalog.' : 'Open a tune to make this useful.'}</small><button type="button" className="workspace-inline-link" onClick={() => navigate('/after-hours')}>Open After Hours →</button></article>
    </section>
    <section className="workspace-note-card"><span className="workspace-eyebrow">Progress later</span><p>Saved presets, favorite voicings, and real practice history belong here eventually. Lesson completion pressure does not.</p><button type="button" className="workspace-danger-link" onClick={onReset}>Reset saved workspace</button></section>
  </section>;
}

export default function WorkspaceApp() {
  return <HashRouter><AppShell /></HashRouter>;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
