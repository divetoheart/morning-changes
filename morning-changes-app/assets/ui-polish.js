(() => {
  const icons = {
    home: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/></svg>',
    learn: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M4 5.5V21.5"/><path d="M8 7h8M8 11h8"/></svg>',
    paths: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="m15.5 8.5-2.1 5-4.8 2.1 2.1-4.8Z"/></svg>',
    afterHours: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>',
    tools: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v16M20 4v16M4 8h5M15 8h5M4 16h9M17 16h3"/><circle cx="11" cy="8" r="2"/><circle cx="15" cy="16" r="2"/></svg>',
    progress: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/><path d="M16 7h3v3"/></svg>'
  };
  const navItems = [
    ['home', 'Home', 'home'],
    ['learn', 'Learn', 'learn'],
    ['paths', 'Paths', 'paths'],
    ['after-hours', 'After Hours', 'afterHours'],
    ['tools', 'Tools', 'tools'],
    ['progress', 'Progress', 'progress']
  ];
  const copy = new Map([
    ['The rails are built now; each course grows through validated lessons.', 'Build a path that fits the way you want to play.'],
    ['Every card has a state: not started, in progress, completed, or ready for review later. The source pipeline is separate from this UI so the catalog can grow without changing the app shell.', 'Every lesson keeps your place: not started, in progress, completed, or ready for another pass.'],
    ['The first two are live; the rest are stable shells for content expansion.', 'Start with Autumn Leaves, then keep adding repertoire at your pace.'],
    ['Premium · planned', 'Premium'],
    ['Lesson shell', 'Lesson preview'],
    ['Stable curriculum infrastructure; lesson body comes next.', 'A focused practice plan is on the way.'],
    ['This card can already hold the learning outcome, duration, prerequisite state, practice routine, metronome target, assets, source record, and review state without changing the app.', 'Save your place now, then return when the complete guided session is ready.'],
    ['Premium is a product shell today—no billing, no fake checkout. The purpose of this screen is to keep the free loop generous while identifying what deeper value will be worth paying for.', 'Morning Changes stays useful every day. Premium opens the full depth of the library when you are ready for more.'],
    ['Premium · planned', 'Premium'],
    ['Browser microphone tuning is the next tool to ship. It will process audio locally in the browser and ask before using the microphone.', 'A focused tuner for quick check-ins before you play.'],
    ['The session stays small on purpose.', 'Keep it focused. Leave with one thing that feels better.'],
    ['The free loop has to be good enough to build an actual habit: daily practice, core tools, starter lessons, local progress, and a rotating standard.', 'Come back for a short practice session, a useful idea, and a clear next step.']
  ]);

  function currentRoute(){ return document.body.dataset.route || 'home'; }
  function appBase(){
    const route = currentRoute();
    const parts = location.pathname.split('/').filter(Boolean);
    const routeIndex = route === 'home' ? -1 : parts.lastIndexOf(route);
    return routeIndex > -1 ? `/${parts.slice(0, routeIndex).join('/')}/` : (location.pathname.endsWith('/') ? location.pathname : `${location.pathname}/`);
  }
  function navLink(route){ return `${appBase()}${route === 'home' ? '' : `${route}/`}`; }
  function mountDock(){
    const app = document.getElementById('app');
    if (!app) return;
    app.querySelector('.mobile-nav')?.remove();
    document.getElementById('mc-mobile-nav')?.remove();
    const route = currentRoute();
    const dock = document.createElement('nav');
    dock.id = 'mc-mobile-nav';
    dock.setAttribute('aria-label', 'Main navigation');
    dock.innerHTML = navItems.map(([key,label,icon]) => `<a href="${navLink(key)}" class="${route === key ? 'active' : ''}" aria-label="${label}">${icons[icon]}<span class="nav-label">${label}</span></a>`).join('');
    document.body.appendChild(dock);
    pinDock();
  }
  function pinDock(){
    const dock = document.getElementById('mc-mobile-nav');
    if (!dock) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    dock.style.bottom = `${offset}px`;
  }
  function replaceVisibleCopy(root){
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const next = copy.get(node.nodeValue.trim());
      if (next) node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), next);
    });
  }
  function polish(){
    mountDock();
    replaceVisibleCopy(document.getElementById('app') || document.body);
    replaceVisibleCopy(document.getElementById('modal') || document.body);
  }
  let queued = false;
  function queue(){
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; polish(); });
  }
  const app = document.getElementById('app');
  if (app) new MutationObserver(queue).observe(app, {childList:true, subtree:true});
  window.visualViewport?.addEventListener('resize', pinDock);
  window.visualViewport?.addEventListener('scroll', pinDock);
  window.addEventListener('orientationchange', () => setTimeout(pinDock, 150));
  document.addEventListener('click', () => setTimeout(queue, 0), true);
  polish();
})();
