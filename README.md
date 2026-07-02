# Morning Changes

Morning Changes is a deliberately small guitar workspace centered on real standards and a shared music engine.

## Active product

The Vite + React app in `apps/web` has four core spaces:

- Home: gateway to the active workspace.
- Fretboard: free-form full-neck inspection and voicing surface.
- After Hours: authored standards library.
- Tools: metronome.

After Hours currently contains two standards:

- Autumn Leaves: whole-form study in frets 7–11, with every written chord available to the focused Fretboard selector.
- 12-Bar Blues: three study variants—Texas Flood, Crossroads, and The Thrill Is Gone.

The old lesson library, learning paths, daily lesson rotation, licks, exercises, practice extras, and lesson-progress profile remain retired. Retired routes redirect Home until a new Learn rebuild is explicitly scoped.

## After Hours identity

Every After Hours route uses the same route-level wordmark state:

```text
●  After Hours
   Standards Library
```

The mark is a solid black circle with a white ring, keeps the normal mark footprint, and remains dark in every theme. It is not a semi-circle glyph or a separate app shell.

## Fretboard builder and keys

The main Fretboard is the free-form workspace. It supports:

- All 15 conventional key signatures: C, seven sharp signatures through C♯, and seven flat signatures through C♭.
- Major or minor study context.
- Typed engine-backed symbols including `9`, `11`, `13`, `maj9–13`, `m9–13`, `add9–13`, `sus`, `sus2`, and `sus4` alongside the foundational chord qualities.
- A tone-builder path with chord tones, extensions (♭9, 9, ♯9, 11, ♯11, ♭13, 13), and Sus2/Sus4 presets.
- A deliberately short primary row: **Pentatonic**, **Arpeggio**, and **Chord**. Chord shows one playable voicing; CAGED, Triads, Scale, inversions, and voicing choice live under **More options**.
- Plain-English fret details using the engine’s spelled note, location, shape identity, and nearest root marker.

The visible Study Key belongs inside the **Shapes and Voicings** Fretboard surface. It is one compact boxed hierarchy—eyebrow, large key/mode label, and key/mode controls—not a standalone panel above the map or a separate badge.

After Hours does **not** use the free-form builder. Its active-chord selection stays limited to the authored chords in the selected standard.

## Release verification

Every Pages build stamps the exact commit into a persistent footer:

```text
Live build · <short commit>
```

Use this footer as the source of truth for what is actually deployed in the browser. Every release update must also name a concrete visible behavior to look for. See `docs/RELEASE_VERIFICATION.md`.

## Engineering boundaries

- Keep music logic in `apps/web/src/lib/music`; UI consumes structured engine data.
- Custom chords use `buildCustomChord`; do not create Fretboard-local note arrays.
- `LayerMembership` includes note, interval, string/fret, role, layer, and optional shape identity so detail copy is engine-derived.
- Compact standard studies reuse `AfterHoursFretboardCustomizer`; do not create parallel chord-chart components.
- A dedicated two-octave scale-path generator is not yet implemented. The existing Scale layer is range-aware context, not a named two-octave route.

## Commands

Run from `apps/web`:

```bash
npm install --no-audit --no-fund
npm run check
npm run music:contract
npm run build
npm run quality
npm run preview
```

GitHub Actions runs TypeScript, music contracts, production build, and browser smoke coverage for Home, Fretboard, Autumn Leaves, and 12-Bar Blues.

## Engineering rules

- Preserve the existing visual identity unless design work is explicitly requested.
- Do not use DOM patches, temporary adapters, or UI-only fixes for engine problems.
- Do not restore retired lesson/daily content without an explicit rebuild work order.
- Keep README, `docs/WORK_ORDER.md`, and `docs/AGENT_HANDOFF.md` current after significant work.
- Green checks normally mean merge and deploy unless explicitly held.
