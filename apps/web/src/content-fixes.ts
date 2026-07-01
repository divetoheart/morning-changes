import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { lessons, standards } from './content/catalog';
import { FretboardMap } from './AfterHoursFretboardCustomizer';
import type { KeyName } from './lib/theory';

const minorCadence = lessons.find(lesson => lesson.id === 'minor-ii-v-i-cadence');
if (minorCadence) {
  Object.assign(minorCadence, {
    keyMode: 'harmonic-minor',
    outcome: 'Understand iiø7–V7–i7 as the harmonic-minor cadence used near the end of the Autumn Leaves A section.',
    concept: {
      ...minorCadence.concept,
      summary: 'Minor iiø–V–i uses a half-diminished ii chord, a dominant V chord, and a minor tonic. The raised 7th from harmonic minor supplies the dominant V chord.',
      intervals: ['1', '2', 'b3', '4', '5', 'b6', '7']
    },
    routine: minorCadence.routine.map(step => ({
      ...step,
      instruction: step.instruction
        .replace('Build iim7b5 V7 im7', 'Build iiø7 V7 i7')
        .replace('Render iim7b5 V7 im7', 'Build iiø7 V7 i7')
        .replace('resolve V7 into i', 'resolve V7 into i using the raised 7th')
    }))
  });
}

const blues = standards.find(standard => standard.id === 'blues-lab-standard');
if (blues) {
  Object.assign(blues, {
    title: '12-Bar Blues',
    subtitle: 'Form, dominant chord targets, turnarounds, and three essential recordings: Texas Flood, Crossroads, and The Thrill Is Gone.',
    status: 'available',
    access: 'free',
    href: '#/after-hours/12-bar-blues',
    focus: 'I–IV–V form · slow blues · dominant targeting'
  });
}

/*
 * The first root lesson now renders the shared full-neck primitive instead of
 * retaining a second visual with hard-coded note labels. It stays synchronized
 * to the lesson key selector and uses roots-only mode.
 */
let rootLessonRoot: Root | undefined;
let rootLessonHost: HTMLElement | undefined;
let rootLessonLegacyCard: HTMLElement | undefined;
let rootLessonSelect: HTMLSelectElement | undefined;
let rootLessonTimer: number | undefined;

function unmountRootLessonFretboard() {
  rootLessonRoot?.unmount();
  rootLessonRoot = undefined;
  rootLessonHost?.remove();
  rootLessonHost = undefined;
  if (rootLessonLegacyCard) rootLessonLegacyCard.style.display = '';
  rootLessonLegacyCard = undefined;
  rootLessonSelect = undefined;
}

function mountRootLessonFretboard() {
  if (!window.location.hash.startsWith('#/lesson/find-the-root')) {
    unmountRootLessonFretboard();
    return;
  }
  const legacyCard = document.querySelector<HTMLElement>('.lesson-page .fretboard-card');
  const keySelect = document.querySelector<HTMLSelectElement>('.lesson-page .key-selector select');
  if (!legacyCard || !keySelect) return;

  if (!rootLessonHost || !rootLessonRoot) {
    rootLessonLegacyCard = legacyCard;
    rootLessonLegacyCard.style.display = 'none';
    rootLessonHost = document.createElement('div');
    rootLessonHost.className = 'shared-root-fretboard-host';
    legacyCard.after(rootLessonHost);
    rootLessonRoot = createRoot(rootLessonHost);
  }

  const render = () => {
    const selectedKey = keySelect.value as KeyName;
    rootLessonRoot?.render(createElement(FretboardMap, {
      keyLabel: selectedKey,
      majorRoot: selectedKey,
      minorRoot: selectedKey,
      chords: [{ label: `${selectedKey}maj7`, root: selectedKey, quality: 'maj7' }],
      description: 'Change the key above. Every marker is interval 1 for that selected key, all the way through the first repeated position after the twelfth fret.',
      cagedLabel: '',
      pentatonicLabel: '',
      mode: 'roots',
      eyebrow: 'Fretboard visual',
      heading: 'Find the root across the neck.'
    }));
  };

  if (rootLessonSelect !== keySelect) {
    rootLessonSelect = keySelect;
    keySelect.addEventListener('change', render);
  }
  render();
}

function scheduleRootLessonFretboard() {
  if (rootLessonTimer) window.clearTimeout(rootLessonTimer);
  rootLessonTimer = window.setTimeout(() => {
    rootLessonTimer = undefined;
    mountRootLessonFretboard();
  }, 0);
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', scheduleRootLessonFretboard);
  const observer = new MutationObserver(scheduleRootLessonFretboard);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleRootLessonFretboard();
}
