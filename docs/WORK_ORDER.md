# Morning Changes Work Order

Last updated: 2026-07-02

## Rules

1. Do not redesign Morning Changes unless explicitly asked.
2. Do not change product content unless explicitly asked.
3. Do not use DOM patches, temporary adapters, or error-boundary-only fixes.
4. Preserve the current visual identity and layout language.
5. Update README, this work order, and agent handoff after significant work.
6. Green checks normally mean merge and deploy unless explicitly held.
7. Every release message must include a visible `Look for:` cue and expected `Live build · <commit>` footer.

## Active core

Navigation is intentionally limited to:

- Home
- Fretboard
- After Hours
- Tools

Home is a core-space gateway, not a daily lesson dashboard.

Routes:

- `/fretboard`: native shared fretboard workspace.
- `/after-hours`: standards library.
- `/after-hours/autumn-leaves`: active standard app.
- `/tools`: metronome.
- `/paths`: redirects to Fretboard for existing links.
- `/learn`, `/lesson/*`, `/practice/*`, `/profile`, and `/progress`: redirect to Home because those systems are retired.

## After Hours wordmark

On any `/after-hours` route:

- Rotate the existing mark 180 degrees.
- Change `Morning Changes` to `After Hours`.
- Change the subtitle to `Standards Library`.

Keep this as a route state, not a separate visual redesign.

## Retired content

The old lesson library, paths, daily lesson rotation, daily licks, daily exercises, practice-extra pages, lesson progress dashboard, and progress persistence are removed.

Do not restore them, add placeholder cards, or recreate the old daily/practice flow unless the user explicitly starts a new rebuild work order.

## Fretboard architecture

`AfterHoursFretboardCustomizer` is the one shared fretboard renderer for full-neck exploration and compact standard/lesson applications.

It supports full or focused ranges, active chords, Triads/inversions, CAGED, pentatonic, arpeggio, scale context, Shell, Drop 2, and the small full-neck handoff.

Autumn Leaves is the first embedded use: relative-major ii–V–I in frets 7–11.

## Quality and release proof

Run:

```bash
cd apps/web
npm run check
npm run music:contract
npm run build
```

Browser smoke verifies:

1. Home has the core spaces and no legacy daily/lesson/path content.
2. Fretboard has its renderer, Triads, voicing controls, footer, and no error boundary.
3. Autumn Leaves has the After Hours wordmark state, focused map, footer, and no error boundary.

The live footer is the deployment source of truth. See `docs/RELEASE_VERIFICATION.md`.

## Next work

1. Verify the deployed core shell and After Hours wordmark manually.
2. Add a true two-octave scale-path generator.
3. Carry focused-map state into the full-neck link.
4. Add ii–V–I voice-leading paths.
5. Add another standard only with a concrete practice outcome.
6. Rebuild Learn later from a fresh work order, not retired data.
