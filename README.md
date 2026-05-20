# Morning Changes

Daily jazz guitar lesson companion.

## Product promise
One focused jazz guitar lesson that can be read, studied, and practiced in 8-15 minutes.

## Session flow
Read -> Study -> Practice -> Done

## Current lesson
Autumn Leaves:
- why this matters
- practice target
- form
- harmonic map
- fretboard overlays
- listening references
- practice checklist

## Architecture
Static GitHub Pages app.

- index.html: app shell and script/style links
- styles.css: editorial UI system
- app.js: state, lesson data, rendering, fretboard, events
- .github/workflows/deploy.yml: static Pages deployment with JS syntax check

## Engineering rules
- Keep deployment static unless there is a clear reason to add a build step.
- Do not reintroduce React/Vite until the app needs component tooling.
- Every visual dot must represent a real note or intentional study marker.
- Preserve a working deploy before major refactors.
- Fresh lessons should reuse the same rendering system.

## Product direction
Current: daily lessons.
Future: standards companion / After Hours scope.
