# Morning Changes web application

This is the production React + TypeScript application. It is the source of truth for the browser app, installed web app, and later iOS/Android containers.

## Local development

```bash
cd apps/web
npm install
npm run dev
```

## Production build

```bash
npm run check
npm run build
```

The static build is written to `apps/web/dist`.

## Product rules

- Content is structured data, not page-specific markup.
- A lesson ID is permanent once published because progress depends on it.
- The same content and progress model serves desktop, mobile web, PWA, iOS, and Android.
- Native mobile work uses the included Capacitor configuration after the web build is stable.
- The pre-React product remains available on the repository archive branch documented in `docs/legacy-static.md`.
