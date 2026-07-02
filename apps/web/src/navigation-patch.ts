const roots = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const noteIndex: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
const notes = roots;
const tuning = [{ label: 'e', note: 'E' }, { label: 'B', note: 'B' }, { label: 'G', note: 'G' }, { label: 'D', note: 'D' }, { label: 'A', note: 'A' }, { label: 'E', note: 'E' }];

function header(eyebrow: string, title: string, copy: string) {
  return `<section class="screen-header"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${copy}</p></section>`;
}

function fretboard(root = 'C') {
  const frets = Array.from({ length: 13 }, (_, fret) => `<span>${fret}</span>`).join('');
  const rows = tuning.map(string => {
    const dots = Array.from({ length: 13 }, (_, fret) => {
      const note = notes[(noteIndex[string.note] + fret) % 12];
      return `<span class="${note === root ? 'has-dot' : ''}">${note === root ? `<i><strong>1</strong><small>${note}</small></i>` : ''}</span>`;
    }).join('');
    return `<div class="fret-row"><b>${string.label}</b>${dots}</div>`;
  }).join('');
  return `${header('Fretboard', 'Find the root.', `Find every ${root} across the first twelve frets. Change the key and the map redraws.`)}<section class="fretboard-card"><div class="interval-panel-head"><div><span class="eyebrow">Root map</span><h3>${root} across the neck</h3></div><label class="key-selector"><span>Key</span><select id="nav-fretboard-key">${roots.map(note => `<option${note === root ? ' selected' : ''}>${note}</option>`).join('')}</select></label></div><div class="fretboard-scroll" tabindex="0" role="region" aria-label="Horizontally scrollable guitar fretboard"><div class="fretboard"><div class="fret-row fret-numbers"><span></span>${frets}</div>${rows}</div></div></section>`;
}

function learn() {
  return `${header('Learn', 'In rebuild.', 'The lesson library is out of the way while it is rebuilt around the finished tools and standards.')}<section class="quiet-list"><span class="list-heading">What is available now</span><article class="coming-soon-tool"><span class="row-icon">◒</span><div><span class="row-label">Use the finished spaces</span><strong>After Hours and Fretboard</strong><small>Standards and the neck are still here. Structured lessons return after those pieces are finished.</small></div><span class="coming-soon-pill">Rebuild</span></article></section>`;
}

function patchNav() {
  document.querySelectorAll<HTMLAnchorElement>('.desktop-nav a, .bottom-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#/paths') { const label = link.querySelector('span:last-child'); if (label) label.textContent = 'Fretboard'; link.setAttribute('aria-label', 'Fretboard'); }
    if (href === '#/progress') { const label = link.querySelector('span:last-child'); if (label) label.textContent = 'Profile'; link.setAttribute('aria-label', 'Profile'); }
  });
}

function patchScreen() {
  patchNav();
  const route = window.location.hash.slice(1).split('?')[0];
  const screen = document.querySelector<HTMLElement>('.screen');
  if (!screen) return;
  if (route === '/learn' && !screen.dataset.surfacePatched) {
    screen.innerHTML = learn();
    screen.dataset.surfacePatched = 'learn';
  } else if (route === '/paths' && screen.dataset.surfacePatched !== 'fretboard') {
    screen.innerHTML = fretboard();
    screen.dataset.surfacePatched = 'fretboard';
    screen.querySelector<HTMLSelectElement>('#nav-fretboard-key')?.addEventListener('change', event => {
      screen.innerHTML = fretboard((event.target as HTMLSelectElement).value);
      screen.dataset.surfacePatched = 'fretboard';
      patchScreen();
    });
  } else if (route === '/progress') {
    screen.dataset.surfacePatched = '';
    const eyebrow = screen.querySelector<HTMLElement>('.screen-header .eyebrow');
    if (eyebrow) eyebrow.textContent = 'Profile';
  } else if (route !== '/learn' && route !== '/paths') {
    screen.dataset.surfacePatched = '';
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => window.setTimeout(patchScreen, 0));
  new MutationObserver(() => window.setTimeout(patchScreen, 0)).observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(patchScreen, 0);
}
