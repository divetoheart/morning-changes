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

const blues = standards.find(standard => standard.id === 'blues-lab-standard');
if (blues) {
  Object.assign(blues, {
    title: '12-Bar Blues',
    subtitle: 'Form, dominant chord targets, turnarounds, and three essential recordings: Texas Flood, Crossroads, and Pride and Joy.',
    status: 'available',
    access: 'free',
    href: '#/after-hours/12-bar-blues',
    focus: 'I–IV–V form · slow blues · dominant targeting'
  });
}
