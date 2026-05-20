const appState = {
  selectedChord: 'Cm7',
  study: 'changes',
  overlays: { shells: true, pentatonic: false, caged: false, arpeggio: false },
};

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <header class="app-header">
      <div class="mark">◒</div>
      <div><strong>Morning Changes</strong><span>A daily jazz guitar lesson</span></div>
    </header>

    <section class="lesson-hero">
      <p class="eyebrow">Standard No. 01 · ${lesson.time}</p>
      <h1>${lesson.title}</h1>
      <h2>${lesson.subtitle}</h2>
      <p>${lesson.objective}</p>
    </section>

    <section class="note-block">
      <p class="section-label">Why we study it</p>
      <p>${lesson.why}</p>
    </section>

    ${renderStudyNav()}
    ${renderStudySection()}
    ${renderListeningSection()}
    ${renderPracticeSection()}
  `;
  bindEvents();
}

function renderStudyNav() {
  const items = [['changes','Chords'],['fretboard','Fretboard'],['listen','Listen'],['practice','Practice']];
  return `<nav class="study-tabs">${items.map(([id,label]) => `<button class="study-tab ${appState.study === id ? 'active' : ''}" data-study="${id}">${label}</button>`).join('')}</nav>`;
}

function renderStudySection() {
  if (appState.study === 'fretboard') return renderFretboardStudy();
  if (appState.study === 'listen') return renderListeningSection();
  if (appState.study === 'practice') return renderPracticeSection();
  return renderChangesStudy();
}

function renderChangesStudy() {
  return `
    <section class="study-section">
      <p class="section-label">Study changes / harmonic map</p>
      <div class="form-line"><strong>A</strong><span>8 bars</span></div>
      <div class="changes-grid">
        ${lesson.progression.map((chord, index) => {
          const active = chord === appState.selectedChord ? 'active' : '';
          return `<button class="change-cell ${active}" data-chord="${chord}"><strong>${chord}</strong><span>${index + 1} · ${chords[chord].fn}</span></button>`;
        }).join('')}
      </div>
      <p class="lesson-copy">${lesson.target}</p>
    </section>
  `;
}

function renderFretboardStudy() {
  const chord = chords[appState.selectedChord];
  return `
    <section class="study-section">
      <p class="section-label">Fretboard study</p>
      <h3>${appState.selectedChord}: ${chord.shell.join(' + ')}</h3>
      <p class="lesson-copy">${chord.cue}</p>
      <div class="meta-row"><span>${lesson.position}</span><span>${lesson.fretWindow}</span></div>
      <div class="fretboard-frame">${renderFretboard()}</div>
      <div class="overlay-tabs">
        ${overlayButton('shells','Shells')}
        ${overlayButton('pentatonic','Pentatonic')}
        ${overlayButton('caged','CAGED')}
        ${overlayButton('arpeggio','Arpeggio')}
      </div>
    </section>
  `;
}

function overlayButton(id, label) {
  return `<button class="overlay-tab ${appState.overlays[id] ? 'active' : ''}" data-overlay="${id}">${label}</button>`;
}

function renderFretboard() {
  let svg = `<svg viewBox="0 0 360 250" role="img" aria-label="Fretboard map for ${appState.selectedChord}">
    <rect x="14" y="14" width="332" height="218" rx="24" fill="#f5eee2"/>
    <g stroke="#988a7a"><line x1="50" y1="52" x2="318" y2="52"/><line x1="50" y1="76" x2="318" y2="76"/><line x1="50" y1="100" x2="318" y2="100"/><line x1="50" y1="124" x2="318" y2="124"/><line x1="50" y1="148" x2="318" y2="148"/><line x1="50" y1="172" x2="318" y2="172" stroke-width="2"/></g>
    <g stroke="#d3c4b3"><line x1="50" y1="40" x2="50" y2="184" stroke="#1e1a16" stroke-width="4"/><line x1="90" y1="40" x2="90" y2="184"/><line x1="130" y1="40" x2="130" y2="184"/><line x1="170" y1="40" x2="170" y2="184"/><line x1="210" y1="40" x2="210" y2="184"/><line x1="250" y1="40" x2="250" y2="184"/><line x1="290" y1="40" x2="290" y2="184"/></g>
    <g font-size="11" fill="#746b60"><text x="30" y="56">e</text><text x="30" y="80">B</text><text x="30" y="104">G</text><text x="30" y="128">D</text><text x="30" y="152">A</text><text x="30" y="176">E</text></g>
    <g font-size="11" fill="#746b60"><text x="70" y="204">8</text><text x="110" y="204">9</text><text x="150" y="204">10</text><text x="190" y="204">11</text><text x="230" y="204">12</text></g>`;
  if (appState.overlays.caged) svg += '<rect x="82" y="45" width="180" height="132" rx="18" fill="none" stroke="#7a4b2a" stroke-width="4" stroke-dasharray="8 6"/>';
  if (appState.overlays.pentatonic) svg += renderDots(fretDots.pentatonic, '#5f6f4f');
  if (appState.overlays.arpeggio) svg += renderDots(fretDots.arpeggios[appState.selectedChord], '#31536b');
  if (appState.overlays.shells) svg += renderDots(fretDots.shells[appState.selectedChord], '#7a4b2a');
  svg += `<text x="38" y="228" font-family="Arial" font-size="12" font-weight="900" fill="#7a4b2a">Selected: ${appState.selectedChord}</text></svg>`;
  return svg;
}

function renderDots(points, color) {
  return points.map(([x,y,label]) => `<circle cx="${x}" cy="${y}" r="11" fill="${color}"/><text x="${x}" y="${y+4}" font-size="9" font-weight="900" text-anchor="middle" fill="#fffdf7">${escapeHtml(label)}</text>`).join('');
}

function renderListeningSection() {
  return `
    <section class="study-section">
      <p class="section-label">Top renditions / selected for study</p>
      <h3>Three for the headphones</h3>
      <div class="listening-list">
        ${lesson.listening.map(item => `<a class="listen-card" href="${item.url}" target="_blank" rel="noopener noreferrer"><strong>${item.title}</strong><span>${item.note}</span></a>`).join('')}
      </div>
      <p class="lesson-copy">${lesson.history}</p>
    </section>
  `;
}

function renderPracticeSection() {
  return `
    <section class="study-section">
      <p class="section-label">Practice now</p>
      <div class="practice-list">${lesson.practice.map(task => `<button class="practice-item"><span></span>${task}</button>`).join('')}</div>
      <p class="tempo-line">Tempo ladder: 60 · 70 · 80 · 90</p>
    </section>
  `;
}

function bindEvents() {
  document.querySelectorAll('[data-study]').forEach(button => button.addEventListener('click', () => { appState.study = button.dataset.study; render(); }));
  document.querySelectorAll('[data-chord]').forEach(button => button.addEventListener('click', () => { appState.selectedChord = button.dataset.chord; appState.study = 'fretboard'; render(); }));
  document.querySelectorAll('[data-overlay]').forEach(button => button.addEventListener('click', () => { appState.overlays[button.dataset.overlay] = !appState.overlays[button.dataset.overlay]; render(); }));
  document.querySelectorAll('.practice-item').forEach(button => button.addEventListener('click', () => button.classList.toggle('done')));
}

render();
