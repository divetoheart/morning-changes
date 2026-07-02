# Agent Handoff: Morning Changes

Last updated: 2026-07-02

## Product identity and operating rules

Morning Changes is Justin's guitar practice workspace. Preserve the existing visual identity. The user does not want generic dashboards, filler copy, broad redesigns, temporary fixes, or hand-coded music data.

Be candid. Do not claim deployment or runtime proof you do not have. Green checks normally mean merge and deploy unless the user explicitly says to hold.

Every significant update refreshes README, `docs/WORK_ORDER.md`, and this file. Every release message must include a concrete `Look for:` cue and the expected `Live build · <short commit>` footer value. See `docs/RELEASE_VERIFICATION.md`.

## Active app scope

The active app has four spaces: Home, Fretboard, After Hours, and Tools.

Home is only a gateway. Retired routes redirect Home:

- `#/learn`
- `#/lesson/*`
- `#/practice/*`
- `#/profile`
- `#/progress`

Do not recreate legacy lessons, paths, daily licks, exercises, practice extras, premium prompts, or lesson progress without a fresh rebuild order.

## After Hours

Any `/after-hours` route has a distinct wordmark state:

- `.after-hours-wordmark-mark` is a solid black circle with a white ring.
- Main label is `After Hours`.
- Subtitle is `Standards Library`.

This is a route state, not a parallel app shell.

Active standards:

- Autumn Leaves: relative-major ii–V–I focused at frets 7–11.
- 12-Bar Blues: Texas Flood, Crossroads, and The Thrill Is Gone variants.

After Hours is an authored setting. Its chord selector must remain restricted to the chords of the selected standard. Never expose the free-form Fretboard builder inside it.

## Source map

- `apps/web/src/App.tsx`
  - Core routes, After Hours wordmark state, standards shelf, Fretboard key/mode controls.
- `apps/web/src/FretboardChordBuilder.tsx`
  - Main-Fretboard-only text and interval-button chord builder.
- `apps/web/src/AfterHoursFretboardCustomizer.tsx`
  - One shared renderer for full-neck and standard applications. Supports optional authored selector hiding and English detail copy.
- `apps/web/src/AfterHoursBluesApp.tsx`
  - The three Blues variants.
- `apps/web/src/after-hours-wordmark.css`
  - Solid black ringed After Hours mark.
- `apps/web/src/fretboard-builder.css`
  - Additive responsive builder and study-key styling.
- `apps/web/src/lib/music/study-keys.ts`
  - Fifteen conventional key signatures and major/minor study-mode types.
- `apps/web/src/lib/music/harmony.ts`
  - Built-in symbols and `buildCustomChord` for interval-selected chords.
- `apps/web/src/lib/music/layers.ts`
  - Shared marker membership includes spelled note, interval, string/fret, role, layer, and variant.
- `apps/web/src/lib/music/contract.ts`
  - Music correctness contract, including custom chords and fifteen signatures.
- `apps/web/scripts/fretboard-smoke.sh`
  - Browser checks for Home, Fretboard, Autumn Leaves, and Blues.

## Shared Fretboard architecture

Use `AfterHoursFretboardCustomizer`; never build a lesson-local static fretboard or parallel chord chart.

For a standard/lesson application:

```ts
fretRange={{ start: 7, end: 11 }}
compact
expandHref="#/fretboard"
chords={[{ chord, scaleMode }]}
defaultLayers={{ triad: true, arpeggio: true }}
```

For the main Fretboard, use the dedicated builder and `showChordSelector={false}`. The parent supplies the one active custom or typed chord.

The renderer supports CAGED, pentatonic, Triads/inversions, arpeggio, scale context, Shell, Drop 2, focused ranges, and collision detail.

Scale is context, not a dedicated two-octave path. The full-neck link does not yet preserve compact-map configuration. Do not claim either is implemented.

## Engine expectations

- `buildCustomChord` is the only interval-button builder path. It requires root `1`, spells every selected interval, and creates a readable chord label.
- `parseChordSymbol` handles typed built-in chord symbols.
- Custom chords can supply arpeggio/scale data and may derive a triad or usable voicing when their tone set supports it.
- Every marker must carry engine-derived note, interval, string/fret, role, and layer membership.
- Detail copy uses that data to explain what a selected marker is and where its nearest root lies.
- Error boundaries contain route crashes; they do not replace source fixes.

## Validation

Minimum checks:

```bash
cd apps/web
npm run check
npm run music:contract
npm run build
```

Browser smoke requires:

- Home: core content and no legacy daily/path language.
- Fretboard: fifteen-key guidance, C♯ and C♭ options, major/minor options, builder, layers, voicing controls, English-detail guidance, footer, no error boundary.
- Autumn Leaves: After Hours mark, focused study, and authored voicing controls.
- Blues: route plus all three variants and footer.

Failure artifacts include Home, Fretboard, Autumn Leaves, Blues DOM captures, and preview logs.

## Next work

1. Verify the deployed builder, key signatures, solid After Hours mark, and Blues shelf manually on desktop and mobile.
2. Add a true two-octave scale-path generator and contract coverage.
3. Carry compact-map state to the full-neck URL.
4. Add ii–V–I voice-leading paths.
5. Add another standard only with a concrete practice outcome.
6. Rebuild Learn later from a new work order—not retired content.
