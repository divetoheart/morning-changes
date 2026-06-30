(() => {
  const STORAGE = 'morning-changes-state-v2';

  function readState() {
    try {
      return {
        lessonStates: {},
        dailyDates: [],
        history: [],
        tempo: 72,
        ...JSON.parse(localStorage.getItem(STORAGE) || '{}')
      };
    } catch {
      return { lessonStates: {}, dailyDates: [], history: [], tempo: 72 };
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE, JSON.stringify(state));
  }

  function today() {
    return new Date().toLocaleDateString('en-CA');
  }

  function dailyLesson() {
    const content = window.MC_CONTENT;
    if (!content?.dailyLessons?.length) return null;
    const start = new Date(2025, 0, 1);
    const index = Math.floor((new Date() - start) / 86400000) % content.dailyLessons.length;
    return content.dailyLessons[index];
  }

  function lessonTitle(id) {
    return window.MC_CONTENT?.lessons?.find(lesson => lesson.id === id)?.title || 'Lesson';
  }

  function close() {
    document.getElementById('modal')?.remove();
  }

  function refresh() {
    window.location.reload();
  }

  document.addEventListener('click', event => {
    const control = event.target.closest('#modal [data-action]');
    if (!control) return;

    const action = control.dataset.action;
    const id = control.dataset.id;

    if (action === 'close-modal') {
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
      return;
    }

    if (action === 'start-lesson' && id) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const state = readState();
      state.lessonStates[id] = 'in-progress';
      saveState(state);
      close();
      refresh();
      return;
    }

    if (action === 'complete-lesson' && id) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const state = readState();
      state.lessonStates[id] = 'completed';
      state.history.push({ title: lessonTitle(id), date: today() });
      saveState(state);
      close();
      refresh();
      return;
    }

    if (action === 'complete-daily') {
      event.preventDefault();
      event.stopImmediatePropagation();
      const plan = dailyLesson();
      if (!plan) return;
      const state = readState();
      state.lessonStates[plan.lessonId] = 'completed';
      if (!state.dailyDates.includes(today())) state.dailyDates.push(today());
      state.history.push({ title: `Daily session · ${lessonTitle(plan.lessonId)}`, date: today() });
      saveState(state);
      close();
      refresh();
      return;
    }

    if (action === 'toggle-metro') {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.querySelector('.tempo-chip')?.click();
      return;
    }

    if (action === 'open-lesson') {
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
      const parts = location.pathname.split('/').filter(Boolean);
      const known = ['learn', 'paths', 'after-hours', 'tools', 'progress'];
      const routeIndex = parts.findIndex(part => known.includes(part));
      const base = routeIndex > -1 ? `/${parts.slice(0, routeIndex).join('/')}/` : (location.pathname.endsWith('/') ? location.pathname : `${location.pathname}/`);
      window.location.href = `${base}learn/`;
      return;
    }

    if (action === 'premium') {
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    }
  }, true);
})();
