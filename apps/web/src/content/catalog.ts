import { lessonSchema, pathSchema, standardSchema, type Lesson, type LearningPath, type Standard } from '../domain/content';

const lessonData = [
  {
    id: 'rhythm-first',
    title: 'Rhythm First: Quarter Notes That Feel Good',
    level: 'Beginner',
    category: 'Rhythm',
    access: 'free',
    durationMinutes: 15,
    outcome: 'Lock one chord to a pulse before adding complexity.',
    dailyEligible: true,
    pathIds: ['beginner-foundations', 'blues-lab'],
    metronome: { bpm: 70, meter: '4/4' },
    routine: [
      { minutes: 3, instruction: 'Tap quarter notes with the metronome at 70 BPM.' },
      { minutes: 5, instruction: 'Strum one chord only on beats 2 and 4.' },
      { minutes: 5, instruction: 'Add one anticipatory change before beat 1.' },
      { minutes: 2, instruction: 'Play one uninterrupted minute and let the pulse carry you.' }
    ],
    reviewPrompt: 'Can you keep the pulse while changing one chord?'
  },
  {
    id: 'open-chord-flow',
    title: 'Open Chord Changes Without the Panic',
    level: 'Beginner',
    category: 'Chords',
    access: 'free',
    durationMinutes: 15,
    outcome: 'Build a clean two-chord loop and stay in time.',
    dailyEligible: true,
    pathIds: ['beginner-foundations'],
    metronome: { bpm: 60, meter: '4/4' },
    routine: [
      { minutes: 3, instruction: 'Choose two familiar open chords and form each shape silently.' },
      { minutes: 5, instruction: 'Change once per bar at 60 BPM without strumming.' },
      { minutes: 5, instruction: 'Add one downstroke on beat 1 of every bar.' },
      { minutes: 2, instruction: 'Play four bars without correcting in the middle.' }
    ],
    reviewPrompt: 'Which finger can stay closest to its next note?'
  },
  {
    id: 'root-map',
    title: 'Find Every Root in One Position',
    level: 'Beginner',
    category: 'Fretboard',
    access: 'free',
    durationMinutes: 15,
    outcome: 'Locate roots without hunting for them.',
    dailyEligible: true,
    pathIds: ['beginner-foundations', 'theory-101'],
    metronome: { bpm: 62, meter: '4/4' },
    routine: [
      { minutes: 3, instruction: 'Pick one root on the sixth string and say its note name.' },
      { minutes: 5, instruction: 'Find its octave on the fourth and second strings.' },
      { minutes: 5, instruction: 'Move the root shape up one fret at a time with the metronome.' },
      { minutes: 2, instruction: 'Name three roots without looking at a chart.' }
    ],
    reviewPrompt: 'Could you find the root before you needed the shape?'
  },
  {
    id: 'pentatonic-home',
    title: 'Make Pentatonic Phrases Sound Like Music',
    level: 'Beginner',
    category: 'Soloing',
    access: 'free',
    durationMinutes: 15,
    outcome: 'Use space, repetition, and a target note to make one familiar shape sound musical.',
    dailyEligible: true,
    pathIds: ['beginner-foundations', 'blues-lab'],
    metronome: { bpm: 72, meter: '4/4' },
    routine: [
      { minutes: 3, instruction: 'Play one note, then leave a full beat of space.' },
      { minutes: 5, instruction: 'Make a two-bar call and answer it with a variation.' },
      { minutes: 5, instruction: 'End each phrase on A or C in A minor.' },
      { minutes: 2, instruction: 'Keep only the phrase you would sing back.' }
    ],
    reviewPrompt: 'Did your rests sound as intentional as your notes?'
  },
  {
    id: 'shell-voicings',
    title: 'Shell Voicings: Start Here',
    level: 'Intermediate',
    category: 'Jazz harmony',
    access: 'free',
    durationMinutes: 12,
    outcome: 'Play roots, 3rds, and 7ths that imply full harmony.',
    dailyEligible: true,
    pathIds: ['intermediate-core', 'changes-arpeggios', 'theory-101'],
    metronome: { bpm: 58, meter: '4/4' },
    routine: [
      { minutes: 3, instruction: 'Build root–3rd–7th shells for cm7 and F7.' },
      { minutes: 4, instruction: 'Play one chord per bar at 58 BPM.' },
      { minutes: 3, instruction: 'Move the same shells to Bbmaj7 and Ebmaj7.' },
      { minutes: 2, instruction: 'Listen for the 3rd and 7th more than the root.' }
    ],
    reviewPrompt: 'Could a listener hear the harmony without a full six-note chord?'
  },
  {
    id: 'guide-tones',
    title: 'Guide Tone Resolution Through ii–V–I',
    level: 'Intermediate',
    category: 'Voice leading',
    access: 'free',
    durationMinutes: 15,
    outcome: 'Hear and play the smallest movement between chords in a ii–V–I.',
    dailyEligible: true,
    pathIds: ['intermediate-core', 'changes-arpeggios', 'theory-101'],
    metronome: { bpm: 60, meter: '4/4' },
    routine: [
      { minutes: 3, instruction: 'Find the 3rd and 7th of cm7 and F7.' },
      { minutes: 5, instruction: 'Resolve the closest notes at 60 BPM.' },
      { minutes: 5, instruction: 'Apply the motion to the first four bars of Autumn Leaves.' },
      { minutes: 2, instruction: 'Record one clean pass or name what still catches you.' }
    ],
    reviewPrompt: 'Can you hear the line that moves by a half step?'
  },
  {
    id: 'minor-ii-v',
    title: 'Minor ii–V: am7b5 to D7 to gm7',
    level: 'Intermediate',
    category: 'Jazz harmony',
    access: 'free',
    durationMinutes: 13,
    outcome: 'Land a minor cadence with clean harmonic gravity.',
    dailyEligible: true,
    pathIds: ['intermediate-core', 'changes-arpeggios', 'theory-101'],
    metronome: { bpm: 60, meter: '4/4' },
    routine: [
      { minutes: 3, instruction: 'Say the chord tones out loud before playing.' },
      { minutes: 4, instruction: 'Play am7b5–D7–gm7 at 60 BPM.' },
      { minutes: 4, instruction: 'Resolve F# to G and C to Bb on purpose.' },
      { minutes: 2, instruction: 'Make a three-note ending on gm7.' }
    ],
    reviewPrompt: 'Can you name the two tension notes that need to resolve?'
  },
  {
    id: 'arpeggio-positions',
    title: 'Arpeggios in One Neck Position',
    level: 'Intermediate',
    category: 'Soloing',
    access: 'premium',
    durationMinutes: 20,
    outcome: 'Follow changes without abandoning one fretboard area.',
    dailyEligible: false,
    pathIds: ['intermediate-core', 'changes-arpeggios'],
    metronome: { bpm: 65, meter: '4/4' },
    routine: [
      { minutes: 4, instruction: 'Choose one six-fret window and find cm7.' },
      { minutes: 6, instruction: 'Connect cm7 to F7 using the nearest chord tone.' },
      { minutes: 6, instruction: 'Continue through Bbmaj7 and Ebmaj7.' },
      { minutes: 4, instruction: 'Play the whole loop without leaving your position.' }
    ],
    reviewPrompt: 'Did every new chord feel nearby rather than like a restart?'
  },
  {
    id: 'blues-targets',
    title: '12-Bar Blues: Target the Chord Change',
    level: 'Intermediate',
    category: 'Blues',
    access: 'premium',
    durationMinutes: 20,
    outcome: 'Make a blues solo outline the form instead of floating over it.',
    dailyEligible: false,
    pathIds: ['intermediate-core', 'blues-lab'],
    metronome: { bpm: 78, meter: '4/4' },
    routine: [
      { minutes: 4, instruction: 'Find the 3rd of each I, IV, and V chord.' },
      { minutes: 6, instruction: 'Land on each 3rd when the chord changes.' },
      { minutes: 6, instruction: 'Add a pentatonic phrase between targets.' },
      { minutes: 4, instruction: 'Play the form once with space after every answer.' }
    ],
    reviewPrompt: 'Could someone hear the form even with no backing track?'
  },
  {
    id: 'drop-two',
    title: 'Drop 2 Voicings That Connect',
    level: 'Advanced',
    category: 'Comping',
    access: 'premium',
    durationMinutes: 25,
    outcome: 'Move chord color across the neck with voice leading.',
    dailyEligible: false,
    pathIds: ['advanced-language'],
    metronome: { bpm: 58, meter: '4/4' },
    routine: [
      { minutes: 5, instruction: 'Build one drop 2 major-seventh shape on the top four strings.' },
      { minutes: 8, instruction: 'Find the nearest inversion for the next chord.' },
      { minutes: 8, instruction: 'Connect four chords with only the smallest possible motion.' },
      { minutes: 4, instruction: 'Listen for the upper voice as a melody.' }
    ],
    reviewPrompt: 'Which voice moved the least?'
  }
] as const;

const pathData = [
  {
    id: 'beginner-foundations',
    title: 'Beginner Foundations',
    eyebrow: 'Foundation · Beginner',
    access: 'free',
    description: 'Build pulse, clean changes, fretboard orientation, and first musical phrases.',
    lessonIds: ['rhythm-first', 'open-chord-flow', 'root-map', 'pentatonic-home'],
    estimatedMinutes: 60
  },
  {
    id: 'intermediate-core',
    title: 'Intermediate Guitar',
    eyebrow: 'Foundation · Intermediate',
    access: 'premium',
    description: 'Connect harmony, comping, fretboard awareness, and real improvisation.',
    lessonIds: ['shell-voicings', 'guide-tones', 'minor-ii-v', 'arpeggio-positions', 'blues-targets'],
    estimatedMinutes: 80
  },
  {
    id: 'advanced-language',
    title: 'Advanced Language',
    eyebrow: 'Foundation · Advanced',
    access: 'premium',
    description: 'Develop voice leading, color, rhythmic control, and arranging choices.',
    lessonIds: ['drop-two'],
    estimatedMinutes: 25
  },
  {
    id: 'changes-arpeggios',
    title: 'Play Through the Changes with Arpeggios',
    eyebrow: 'Specialization',
    access: 'premium',
    description: 'Build the skill that turns a scale into a real solo through harmony.',
    lessonIds: ['shell-voicings', 'guide-tones', 'arpeggio-positions', 'minor-ii-v'],
    estimatedMinutes: 60
  },
  {
    id: 'blues-lab',
    title: 'Solo Over a 12-Bar Blues',
    eyebrow: 'Specialization',
    access: 'premium',
    description: 'Move from a familiar pentatonic shape to intentional chord targeting.',
    lessonIds: ['rhythm-first', 'pentatonic-home', 'blues-targets'],
    estimatedMinutes: 50
  },
  {
    id: 'theory-101',
    title: 'Theory 101 for Guitar',
    eyebrow: 'Specialization',
    access: 'premium',
    description: 'Learn intervals, scales, chords, keys, and harmonic function on the fretboard.',
    lessonIds: ['root-map', 'shell-voicings', 'guide-tones', 'minor-ii-v'],
    estimatedMinutes: 55
  }
] as const;

const standardData = [
  {
    id: 'autumn-leaves',
    title: 'Autumn Leaves',
    subtitle: 'Harmony map, shell voicings, and an arpeggio play-along.',
    status: 'available',
    access: 'free',
    href: '../after-hours/autumn-leaves/',
    focus: 'ii–V–I voice leading and minor cadences'
  },
  {
    id: 'blue-bossa',
    title: 'Blue Bossa',
    subtitle: 'Minor-key phrasing, cadence awareness, and a compact form.',
    status: 'coming-soon',
    access: 'premium',
    href: '#',
    focus: 'Minor ii–V movement'
  },
  {
    id: 'blues-lab-standard',
    title: '12-Bar Blues Lab',
    subtitle: 'Chord targets, turnarounds, and language inside a familiar form.',
    status: 'coming-soon',
    access: 'premium',
    href: '#',
    focus: 'Dominant-chord targeting'
  }
] as const;

export const lessons: Lesson[] = lessonData.map(item => lessonSchema.parse(item));
export const paths: LearningPath[] = pathData.map(item => pathSchema.parse(item));
export const standards: Standard[] = standardData.map(item => standardSchema.parse(item));

export function lessonById(id: string) {
  return lessons.find(lesson => lesson.id === id);
}

export function pathById(id: string) {
  return paths.find(path => path.id === id);
}
