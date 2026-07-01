export function AfterHoursAutumnLeavesApp() {
  return <div className="app-shell after-hours-embed-shell">
    <header className="app-topbar">
      <a className="wordmark" href="#/"><span className="wordmark-mark">◒</span><span><strong>Morning Changes</strong><small>Daily guitar practice</small></span></a>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#/">Home</a><a href="#/learn">Learn</a><a href="#/paths">Paths</a><a className="active" href="#/after-hours">After</a><a href="#/tools">Tools</a><a href="#/progress">Progress</a>
      </nav>
      <a className="tempo-button" href="#/after-hours">After Hours</a>
    </header>
    <main className="after-hours-embed-main">
      <div className="after-hours-embed-bar"><a href="#/after-hours">← After Hours</a><span>Autumn Leaves</span><a href="after-hours/autumn-leaves/" target="_blank" rel="noreferrer">Open guide ↗</a></div>
      <iframe className="after-hours-guide-frame" title="After Hours — Autumn Leaves" src="after-hours/autumn-leaves/" />
    </main>
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <a href="#/"><span>⌂</span><small>Home</small></a><a href="#/learn"><span>▤</span><small>Learn</small></a><a href="#/paths"><span>◉</span><small>Paths</small></a><a className="active" href="#/after-hours"><span>♫</span><small>After</small></a><a href="#/tools"><span>⚙</span><small>Tools</small></a><a href="#/progress"><span>↗</span><small>Progress</small></a>
    </nav>
  </div>;
}
