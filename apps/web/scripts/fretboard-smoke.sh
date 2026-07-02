#!/usr/bin/env bash
set -euo pipefail

git rev-parse HEAD^{tree} > "$RUNNER_TEMP/git-tree.sha"
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 > "$RUNNER_TEMP/fretboard-preview.log" 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do
  if curl --fail --silent http://127.0.0.1:4173/ >/dev/null; then break; fi
  sleep 1
done

browser="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser)"
if [ -z "$browser" ]; then
  echo "No headless Chromium executable is available on this runner."
  exit 1
fi

"$browser" --headless --no-sandbox --disable-gpu --disable-dev-shm-usage --virtual-time-budget=5000 --dump-dom 'http://127.0.0.1:4173/#/fretboard' > "$RUNNER_TEMP/fretboard.html"

fail() {
  echo "$1"
  echo '--- Fretboard DOM ---'
  cat "$RUNNER_TEMP/fretboard.html"
  echo '--- Preview server log ---'
  cat "$RUNNER_TEMP/fretboard-preview.log"
  exit 1
}

if ! grep -Fq 'Explore the neck.' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard heading did not render.'; fi
if ! grep -Fq 'ah-fretboard-customizer' "$RUNNER_TEMP/fretboard.html"; then fail 'Shared Fretboard renderer did not render.'; fi
if grep -Fq 'This screen could not load.' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard route reached the application error boundary.'; fi
