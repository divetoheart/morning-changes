const appState = {
  selectedChord: 'Cm7',
  tab: 'today',
  overlays: {
    shells: true,
    pentatonic: false,
    caged: false,
    arpeggio: false,
  },
};

const lesson = {
  title: 'Autumn Leaves',
  subtitle: 'A-Section Survival Map',
  time: '15 min',
  objective: 'Map the first eight bars with form, harmony, shell tones, arpeggio targets, and one contained fretboard position.',
  why: 'Autumn Leaves teaches major ii–V–I and minor iiø–V–i movement inside one tune. That makes it one of the cleanest standards for learning how jazz harmony actually moves.',
  target: 'Connect Cm7 → F7 → Bbmaj7 using shell tones first. Add pentatonic color only after the resolution is clear.',
  history: 'Originally a French song, Autumn Leaves became a jazz standard because the harmony is memorable, practical, and endlessly reusable.',
  position: '8th position',
  fretWindow: 'Frets 8–12',
  form: ['A1', 'A2', 'B', 'A3'],
  progression: ['Cm7', 'F7', 'Bbmaj7', 'Ebmaj7', 'Am7b5', 'D7', 'Gm7', 'Gm7'],
  practice: [
    'Say the form out loud: A1, A2, B, A3.',
    'Tap through the A1 progression and name each chord function.',
    'Play only the shell tones through the first four bars.',
    'Turn on arpeggios and target one chord tone per bar.',
    'Use G minor pentatonic briefly, then resolve back to shell tones.',
  ],
  listening: [
    { title: 'Cannonball Adderley', note: 'Hear the standard in a classic small-group setting.', url: 'https://www.youtube.com/results?search_query=Cannonball+Adderley+Autumn+Leaves' },
    { title: 'Bill Evans Trio', note: 'Listen for form, space, and harmonic movement.', url: 'https://www.youtube.com/results?search_query=Bill+Evans+Autumn+Leaves' },
    { title: 'Joe Pass', note: 'Study solo guitar vocabulary and chord movement.', url: 'https://www.youtube.com/results?search_query=Joe+Pass+Autumn+Leaves' },
  ],
};

const chords = {
  Cm7: { fn: 'ii in Bb', shell: ['Eb', 'Bb'], arp: ['C', 'Eb', 'G', 'Bb'], cue: 'Minor ii: hear Eb and Bb before the dominant.' },
  F7: { fn: 'V in Bb', shell: ['A', 'Eb'], arp: ['F', 'A', 'C', 'Eb'], cue: 'Dominant: A defines the sound; Eb wants to resolve.' },
  Bbmaj7: { fn: 'I in Bb', shell: ['D', 'A'], arp: ['Bb', 'D', 'F', 'A'], cue: 'Resolution: land clearly before moving on.' },
  Ebmaj7: { fn: 'IV in Bb', shell: ['G', 'D'], arp: ['Eb', 'G', 'Bb', 'D'], cue: 'Major color: the IV chord opens the section.' },
  Am7b5: { fn: 'iiø in Gm', shell: ['C', 'G'], arp: ['A', 'C', 'Eb', 'G'], cue: 'Half-diminished setup into D7.' },
  D7: { fn: 'V in Gm', shell: ['F#', 'C'], arp: ['D', 'F#', 'A', 'C'], cue: 'Strong pull into the minor home chord.' },
  Gm7: { fn: 'i in Gm', shell: ['Bb', 'F'], arp: ['G', 'Bb', 'D', 'F'], cue: 'Minor home base. Let the phrase settle.' },
};

const fretDots = {
  pentatonic: [
    [250, 52, 'D'], [90, 76, 'Bb'], [250, 76, 'C'], [250, 100, 'F'],
    [90, 124, 'Bb'], [250, 124, 'C'], [170, 148, 'G'], [250, 148, 'Bb'],
    [170, 172, 'D'], [250, 172, 'F'],
  ],
  shells: {
    Cm7: [[250, 100, 'Eb'], [90, 76, 'Bb']],
    F7: [[170, 124, 'A'], [250, 100, 'Eb']],
    Bbmaj7: [[250, 52, 'D'], [170, 76, 'A']],
    Ebmaj7: [[170, 148, 'G'], [250, 52, 'D']],
    Am7b5: [[250, 76, 'C'], [170, 148, 'G']],
    D7: [[170, 100, 'F#'], [250, 76, 'C']],
    Gm7: [[90, 76, 'Bb'], [250, 172, 'F']],
  },
  arpeggios: {
    Cm7: [[250, 76, 'C'], [250, 100, 'Eb'], [170, 148, 'G'], [90, 76, 'Bb']],
    F7: [[250, 172, 'F'], [170, 124, 'A'], [250, 76, 'C'], [250, 100, 'Eb']],
    Bbmaj7: [[90, 76, 'Bb'], [250, 52, 'D'], [250, 172, 'F'], [170, 76, 'A']],
    Ebmaj7: [[250, 100, 'Eb'], [170, 148, 'G'], [90, 76, 'Bb'], [250, 52, 'D']],
    Am7b5: [[170, 76, 'A'], [250, 76, 'C'], [250, 100, 'Eb'], [170, 148, 'G']],
    D7: [[250, 52, 'D'], [170, 100, 'F#'], [170, 76, 'A'], [250, 76, 'C']],
    Gm7: [[170, 148, 'G'], [90, 76, 'Bb'], [250, 52, 'D'], [250, 172, 'F']],
  },
};

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function card(content, className = '') {
  return `<article class="card ${className}">${content}</article>`;
}

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="top">
      <div class="brand">Morning Changes</div>
      <div class="day">${lesson.title} · ${lesson.time}</div>
    </div>
    <section class="assignment">
      <p>Today’s Lesson</p>
      <h1>${lesson.title}: ${lesson.subtitle}</h1>
      <small>${lesson.objective}</small>
    </section>
    ${renderTabs()}
    ${renderPanels()}
  `;

  bindEvents();
}

function renderTabs() {
  const tabs = [
    ['today', 'Today'],
    ['library', 'Library'],
    ['standards', 'Tunes'],
    ['visuals', 'Visuals'],
    ['practice', 'Practice'],
  ];

  return `<nav class="tabs">${tabs.map(([id, label]) => `<button class="tab ${appState.tab === id ? 'active' : ''}" data-tab="${id}">${label}</button>`).join('')}</nav>`;
}

function renderPanels() {
  return `
    <section id="today" class="panel ${appState.tab === 'today' ? 'active' : ''}">${renderToday()}</section>
    <section id="library" class="panel ${appState.tab === 'library' ? 'active' : ''}">${renderLibrary()}</section>
    <section id="standards" class="panel ${appState.tab === 'standards' ? 'active' : ''}">${renderStandards()}</section>
    <section id="visuals" class="panel ${appState.tab === 'visuals' ? 'active' : ''}">${renderVisuals()}</section>
    <section id="practice" class="panel ${appState.tab === 'practice' ? 'active' : ''}">${renderPractice()}</section>
  `;
}

function renderToday() {
  return [
    renderEditorialCard('Why this matters', lesson.why),
    renderEditorialCard('Practice target', lesson.target),
    renderFormCard(),
    renderProgressionCard(),
    renderFretboardCard(),
    renderListeningCard(),
    renderPractice(),
  ].join('');
}

function renderEditorialCard(label, text) {
  return card(`<p class="section-label">${label}</p><p class="lead">${text}</p>`);
}

function renderFormCard() {
  return card(`
    <p class="section-label">Form</p>
    <div class="form">${lesson.form.map((section) => `<div>${section}<small>8 bars</small></div>`).join('')}</div>
    <p class="lead">Start with A1. Keep the form visible so the fretboard work stays connected to the tune.</p>
  `);
}

function renderProgressionCard() {
  const bars = lesson.progression.map((chord, index) => {
    const active = chord === appState.selectedChord ? 'active' : '';
    return `<button class="bar ${active}" data-chord="${chord}"><small>${index + 1} · ${chords[chord].fn}</small>${chord}</button>`;
  }).join('');

  return card(`<p class="section-label">Harmonic map · tap a bar</p><div class="chart">${bars}</div>`);
}

function renderFretboardCard() {
  const chord = chords[appState.selectedChord];
  return card(`
    <p class="section-label">Fretboard study</p>
    <h2>${appState.selectedChord}: ${chord.shell.join(' + ')}</h2>
    <p class="lead">${chord.cue}</p>
    <div class="position-row"><span class="position-chip">${lesson.position}</span><span class="position-chip">${lesson.fretWindow}</span></div>
    <div class="visual">${renderFretboard()}</div>
    <div class="controls">
      ${renderOverlayButton('shells', 'Shells')}
      ${renderOverlayButton('pentatonic', 'Pentatonic')}
      ${renderOverlayButton('caged', 'CAGED')}
      ${renderOverlayButton('arpeggio', 'Arpeggio')}
    </div>
  `);
}

function renderOverlayButton(id, label) {
  return `<button class="control ${appState.overlays[id] ? 'active' : ''}" data-overlay="${id}">${label}</button>`;
}

function renderFretboard() {
  let svg = `<svg viewBox="0 0 360 250" role="img" aria-label="Fretboard map for ${appState.selectedChord}">
    <rect x="14" y="14" width="332" height="218" rx="24" fill="#fbf5ea"/>
    <g stroke="#8b7d70">
      <line x1="50" y1="52" x2="318" y2="52"/><line x1="50" y1="76" x2="318" y2="76"/>
      <line x1="50" y1="100" x2="318" y2="100"/><line x1="50" y1="124" x2="318" y2="124"/>
      <line x1="50" y1="148" x2="318" y2="148"/><line x1="50" y1="172" x2="318" y2="172" stroke-width="2"/>
    </g>
    <g stroke="#d4c5b5">
      <line x1="50" y1="40" x2="50" y2="184" stroke="#1e1a16" stroke-width="4"/>
      <line x1="90" y1="40" x2="90" y2="184"/><line x1="130" y1="40" x2="130" y2="184"/>
      <line x1="170" y1="40" x2="170" y2="184"/><line x1="210" y1="40" x2="210" y2="184"/>
      <line x1="250" y1="40" x2="250" y2="184"/><line x1="290" y1="40" x2="290" y2="184"/>
    </g>
    <g font-size="11" fill="#746b60"><text x="30" y="56">e</text><text x="30" y="80">B</text><text x="30" y="104">G</text><text x="30" y="128">D</text><text x="30" y="152">A</text><text x="30" y="176">E</text></g>
    <g font-size="11" fill="#746b60"><text x="70" y="204">8</text><text x="110" y="204">9</text><text x="150" y="204">10</text><text x="190" y="204">11</text><text x="230" y="204">12</text></g>`;

  if (appState.overlays.caged) {
    svg += '<rect x="82" y="45" width="180" height="132" rx="18" fill="none" stroke="#7a4b2a" stroke-width="4" stroke-dasharray="8 6"/>';
  }
  if (appState.overlays.pentatonic) svg += renderDots(fretDots.pentatonic, '#5f6f4f');
  if (appState.overlays.arpeggio) svg += renderDots(fretDots.arpeggios[appState.selectedChord], '#31536b');
  if (appState.overlays.shells) svg += renderDots(fretDots.shells[appState.selectedChord], '#7a4b2a');

  svg += `<text x="38" y="228" font-family="Arial" font-size="12" font-weight="900" fill="#7a4b2a">Selected: ${appState.selectedChord} · use overlays as study lenses</text></svg>`;
  return svg;
}

function renderDots(points, color) {
  return points.map(([x, y, label]) => `<circle cx="${x}" cy="${y}" r="11" fill="${color}"/><text x="${x}" y="${y + 4}" font-size="9" font-weight="900" text-anchor="middle" fill="#fffdf7">${escapeHtml(label)}</text>`).join('');
}

function renderListeningCard() {
  const links = lesson.listening.map((item) => `<a class="linkcard" href="${item.url}" target="_blank" rel="noopener noreferrer"><strong>${item.title}</strong><small>${item.note}</small></a>`).join('');
  return card(`<p class="section-label">Listen</p><div class="links">${links}</div><p class="lead">${lesson.history}</p>`);
}

function renderPractice() {
  const tasks = lesson.practice.map((task) => `<button class="task"><span class="check"></span><span>${task}</span></button>`).join('');
  return card(`<p class="section-label">Practice now</p><div class="practice">${tasks}</div><div class="tempo">Tempo ladder: 60 · 70 · 80 · 90</div>`);
}

function renderLibrary() {
  return card(`<p class="section-label">Archive</p><div class="mini"><strong>Autumn Leaves</strong>A-section survival map. Fresh lessons will use the same reusable engine.</div>`);
}

function renderStandards() {
  return card(`<p class="section-label">Tune data</p><div class="mini"><strong>A1 progression</strong>Cm7 · F7 · Bbmaj7 · Ebmaj7 · Am7b5 · D7 · Gm7 · Gm7</div>`);
}

function renderVisuals() {
  const chord = chords[appState.selectedChord];
  return card(`<p class="section-label">Selected chord</p><div class="mini"><strong>${appState.selectedChord}</strong><br>Function: ${chord.fn}<br>Shell: ${chord.shell.join(' + ')}<br>Arpeggio: ${chord.arp.join(' · ')}</div>`);
}

function bindEvents() {
  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      appState.tab = button.dataset.tab;
      render();
    });
  });

  document.querySelectorAll('[data-chord]').forEach((button) => {
    button.addEventListener('click', () => {
      appState.selectedChord = button.dataset.chord;
      render();
    });
  });

  document.querySelectorAll('[data-overlay]').forEach((button) => {
    button.addEventListener('click', () => {
      const overlay = button.dataset.overlay;
      appState.overlays[overlay] = !appState.overlays[overlay];
      render();
    });
  });

  document.querySelectorAll('.task').forEach((button) => {
    button.addEventListener('click', () => button.classList.toggle('done'));
  });
}

render();
