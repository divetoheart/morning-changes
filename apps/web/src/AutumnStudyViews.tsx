import type { StudyKey } from './after-hours-types';

export type AutumnView = 'chords' | 'caged' | 'pentatonic' | 'arpeggios' | 'scales';

/**
 * Retired with the lesson catalog. The current product uses the authored
 * After Hours standard surface directly instead of maintaining a parallel view.
 */
export function AutumnStudyViews(_: { study: StudyKey; view: AutumnView }) {
  return null;
}
