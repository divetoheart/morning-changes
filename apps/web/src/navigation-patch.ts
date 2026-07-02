function rebuildNotice() {
  return '<section id="learn-rebuild-notice" class="quiet-list"><span class="list-heading">In rebuild</span><article class="coming-soon-tool"><span class="row-icon">◒</span><div><span class="row-label">Use the finished spaces</span><strong>After Hours and Fretboard</strong><small>Standards and the neck are still here. Structured lessons return after those pieces are finished.</small></div><span class="coming-soon-pill">Rebuild</span></article></section>';
}

function patchNavigation() {
  document.querySelectorAll<HTMLAnchorElement>('.desktop-nav a, .bottom-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#/paths') {
      link.setAttribute('href', '#/lesson/find-the-root');
      link.setAttribute('aria-label', 'Fretboard');
      const label = link.querySelector('span:last-child');
      if (label) label.textContent = 'Fretboard';
    }
    if (href === '#/progress') {
      link.setAttribute('aria-label', 'Profile');
      const label = link.querySelector('span:last-child');
      if (label) label.textContent = 'Profile';
    }
  });
}

function patchLearnScreen() {
  const screen = document.querySelector<HTMLElement>('.screen');
  if (!screen || window.location.hash.slice(1).split('?')[0] !== '/learn') return;
  const header = screen.querySelector<HTMLElement>('.screen-header');
  const eyebrow = header?.querySelector<HTMLElement>('.eyebrow');
  const title = header?.querySelector('h1');
  const copy = header?.querySelector('p');
  if (eyebrow) eyebrow.textContent = 'Learn';
  if (title) title.textContent = 'In rebuild.';
  if (copy) copy.textContent = 'The lesson library is out of the way while it is rebuilt around the finished tools and standards.';
  screen.querySelectorAll<HTMLElement>('.continue-card, .catalog-section').forEach(section => { section.style.display = 'none'; });
  if (!screen.querySelector('#learn-rebuild-notice')) screen.insertAdjacentHTML('beforeend', rebuildNotice());
}

function patchProfileScreen() {
  const screen = document.querySelector<HTMLElement>('.screen');
  if (!screen || window.location.hash.slice(1).split('?')[0] !== '/progress') return;
  const eyebrow = screen.querySelector<HTMLElement>('.screen-header .eyebrow');
  if (eyebrow) eyebrow.textContent = 'Profile';
}

function patch() {
  patchNavigation();
  patchLearnScreen();
  patchProfileScreen();
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => window.setTimeout(patch, 0));
  new MutationObserver(() => window.setTimeout(patch, 0)).observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(patch, 0);
}
