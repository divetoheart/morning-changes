import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { lessons, standards } from './content/catalog';
import { FretboardMap } from './AfterHoursFretboardCustomizer';
import { IntervalNotation } from './MusicNotation';
import { buildChord } from './lib/music';
import type { KeyName } from './lib/theory';

const minorCadence = lessons.find(lesson => lesson.id === 'minor-ii-v-i-cadence');
if (minorCadence) {
  Object.assign(minorCadence, {
    keyMode: 'harmonic-minor',
    outcome: 'Understand iiø7–V7–i7 as the harmonic-minor cadence used near the end of the Autumn Leaves A section.',
    concept: { ...minorCadence.concept, summary: 'Minor iiø–V–i uses a half-diminished ii chord, a dominant V chord, and a minor tonic. The raised 7th from harmonic minor supplies the dominant V chord.', intervals: ['1', '2', 'b3', '4', '5', 'b6', '7'] },
    routine: minorCadence.routine.map(step => ({ ...step, instruction: step.instruction.replace('Build iim7b5 V7 im7', 'Build iiø7 V7 i7').replace('Render iim7b5 V7 im7', 'Build iiø7 V7 i7').replace('resolve V7 into i', 'resolve V7 into i using the raised 7th') }))
  });
}

const blues = standards.find(standard => standard.id === 'blues-lab-standard');
if (blues) Object.assign(blues, { title: '12-Bar Blues', subtitle: 'Form, dominant chord targets, turnarounds, and three essential recordings: Texas Flood, Crossroads, and The Thrill Is Gone.', status: 'available', access: 'free', href: '#/after-hours/12-bar-blues', focus: 'I–IV–V form · slow blues · dominant targeting' });

/* Transitional bridge pending native LessonPage extraction. */
let rootLessonRoot: Root | undefined;
let rootLessonHost: HTMLElement | undefined;
let rootLessonLegacyCard: HTMLElement | undefined;
let rootLessonSelect: HTMLSelectElement | undefined;
let rootLessonTimer: number | undefined;
let renderedRootKey: KeyName | undefined;

function unmountRootLessonFretboard() {
  rootLessonRoot?.unmount(); rootLessonRoot = undefined; rootLessonHost?.remove(); rootLessonHost = undefined;
  if (rootLessonLegacyCard) rootLessonLegacyCard.style.display = '';
  rootLessonLegacyCard = undefined; rootLessonSelect = undefined; renderedRootKey = undefined;
}
function renderRootLessonFretboard(selectedKey: KeyName) {
  if (!rootLessonRoot || renderedRootKey === selectedKey) return;
  renderedRootKey = selectedKey;
  rootLessonRoot.render(createElement(FretboardMap, {
    keyLabel: selectedKey, majorRoot: selectedKey, minorRoot: selectedKey,
    chords: [{ chord: buildChord(selectedKey, 'major7') }],
    description: createElement('span', null, 'Change the key above. Every marker is interval ', createElement(IntervalNotation, { interval: '1' }), ' for that selected key, all the way through the first repeated position after the twelfth fret.'),
    cagedLabel: '', pentatonicLabel: '', mode: 'roots', eyebrow: 'Fretboard visual', heading: 'Find the root across the neck.'
  }));
}
function mountRootLessonFretboard() {
  if (!window.location.hash.startsWith('#/lesson/find-the-root')) { unmountRootLessonFretboard(); return; }
  const legacyCard = document.querySelector<HTMLElement>('.lesson-page .fretboard-card');
  const keySelect = document.querySelector<HTMLSelectElement>('.lesson-page .key-selector select');
  if (!legacyCard || !keySelect) return;
  if (!rootLessonHost || !rootLessonRoot) {
    rootLessonLegacyCard = legacyCard; rootLessonLegacyCard.style.display = 'none'; rootLessonHost = document.createElement('div'); rootLessonHost.className = 'shared-root-fretboard-host'; legacyCard.after(rootLessonHost); rootLessonRoot = createRoot(rootLessonHost); renderedRootKey = undefined;
  }
  if (rootLessonSelect !== keySelect) { rootLessonSelect = keySelect; keySelect.addEventListener('change', () => renderRootLessonFretboard(keySelect.value as KeyName)); }
  renderRootLessonFretboard(keySelect.value as KeyName);
}
function scheduleRootLessonFretboard() {
  if (rootLessonTimer) window.clearTimeout(rootLessonTimer);
  rootLessonTimer = window.setTimeout(() => { rootLessonTimer = undefined; mountRootLessonFretboard(); }, 0);
}
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', scheduleRootLessonFretboard);
  const observer = new MutationObserver(scheduleRootLessonFretboard);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleRootLessonFretboard();
}