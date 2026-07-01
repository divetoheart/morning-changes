import { lessons, standards } from './content/catalog';

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

if (!standards.some(standard => standard.id === 'texas-flood')) {
  standards.splice(1, 0, {
    id: 'texas-flood',
    title: 'Texas Flood',
    subtitle: 'SRV recording: G♭ major concert pitch. Use G shapes with the guitar tuned down one half-step.',
    status: 'available',
    access: 'free',
    href: '#/after-hours/autumn-leaves?standard=texas-flood',
    focus: 'Slow 12-bar Texas blues · SRV key reference'
  });
}

if (typeof window !== 'undefined') {
  window.setTimeout(() => {
    document.querySelectorAll<HTMLElement>('.standard-row').forEach(row => {
      if (!/Texas Flood/i.test(row.textContent ?? '')) return;
      const link = row.querySelector<HTMLAnchorElement>('a');
      if (link) link.setAttribute('href', '#/after-hours/autumn-leaves?standard=texas-flood');
    });
  }, 0);
}
