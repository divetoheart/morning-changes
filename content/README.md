# Morning Changes content pipeline

This directory is the publishing boundary between raw research and user-facing lessons. The app UI reads a stable content registry; adding lessons should not require touching navigation, progress code, or the deploy workflow.

## Content intake

Every source used for a Morning Changes lesson gets a source record with:

- source URL or owned-file identifier
- author / publisher
- rights or license status
- whether it is publishable, reference-only, or needs permission
- lesson concepts it supports
- fact / theory checks still required

## Rights rules

### Publishable sources

- original Morning Changes material
- verified public-domain material
- Creative Commons or other open-license material whose conditions are met
- material used with explicit permission or a license

### Reference-only sources

- paid courses, books, membership libraries, videos, and other copyrighted educational products
- any source whose licensing status is unclear

Reference-only material may inform an original lesson plan, but it is not copied, transcribed, rehosted, or turned into near-substitute diagrams/text. Morning Changes should add original structure, original exercises, original visuals, and its own accurate teaching voice.

## Lesson authoring checklist

1. Define one practical outcome.
2. State prerequisites, or make the lesson self-contained in 15–30 minutes.
3. Write a practice routine with an actual time budget.
4. Build any fretboard visual from validated note data rather than hand-placed dots.
5. Attach source records and a theory QA note.
6. Add the lesson to one or more learning paths.
7. Mark access: `free` or `premium`.
8. Test desktop, mobile, progress state, and metronome launch behavior.

## Release cadence

- Add content in batches through the registry.
- Validate lesson JSON against `lesson.schema.json` before publish.
- Deploy content-only changes independently from UI releases.
- Preserve old lesson IDs: progress history depends on stable IDs.
