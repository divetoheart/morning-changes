# Release Verification Protocol

Morning Changes is a live test site. A merge SHA by itself is not a useful signal to the user, because it is invisible in the deployed app.

## The visible build signal

Every Pages build receives `VITE_APP_COMMIT_SHA` from GitHub Actions. The app renders it in the persistent footer as:

```text
Live build · <short commit>
```

The short commit links to the full GitHub commit. A local development build may show `local` instead.

## Required release communication

After any merged app or workflow change, tell the user exactly what to look for in this format:

```text
Look for: <specific visible feature or behavior>.
Footer check: Live build · <short merge commit>.
```

Examples:

- `Look for: “Apply this in Autumn Leaves” and the focused 7–11 fret ii–V–I map.`
- `Footer check: Live build · d5de901.`

Do not claim the Pages deployment is complete until the live footer shows the merged commit. If GitHub status is unavailable through the connector, say that plainly and instruct the user to compare the visible footer value.

## Engineering rules

- The footer is build metadata, not a manually maintained version string.
- Do not hard-code a commit in source.
- The deployment workflow must inject `VITE_APP_COMMIT_SHA: ${{ github.sha }}` for the production build.
- Browser smoke must continue to require `Live build` so the visible signal cannot silently disappear.
- A significant release must update `README.md`, `docs/WORK_ORDER.md`, and `docs/AGENT_HANDOFF.md` when the workflow or release rules change.
