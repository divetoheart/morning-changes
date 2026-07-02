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
"$browser" --headless --no-sandbox --disable-gpu --disable-dev-shm-usage --virtual-time-budget=5000 --dump-dom 'http://127.0.0.1:4173/#/after-hours/autumn-leaves' > "$RUNNER_TEMP/autumn-leaves.html"

fail() {
  echo "$1"
  echo '--- Fretboard DOM ---'
  cat "$RUNNER_TEMP/fretboard.html"
  echo '--- Autumn Leaves DOM ---'
  cat "$RUNNER_TEMP/autumn-leaves.html"
  echo '--- Preview server log ---'
  cat "$RUNNER_TEMP/fretboard-preview.log"
  exit 1
}

if ! grep -Fq 'Explore the neck.' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard heading did not render.'; fi
if ! grep -Fq 'ah-fretboard-customizer' "$RUNNER_TEMP/fretboard.html"; then fail 'Shared Fretboard renderer did not render.'; fi
if ! grep -Fq '>Triads<' "$RUNNER_TEMP/fretboard.html"; then fail 'Triad layer control did not render.'; fi
if ! grep -Fq 'Triad inversion' "$RUNNER_TEMP/fretboard.html"; then fail 'Triad inversion control did not render.'; fi
if ! grep -Fq 'Chord voicing' "$RUNNER_TEMP/fretboard.html"; then fail 'Chord voicing selector did not render.'; fi
if ! grep -Fq 'Drop 2' "$RUNNER_TEMP/fretboard.html"; then fail 'Drop 2 selector option did not render.'; fi
if grep -Fq 'This screen could not load.' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard route reached the application error boundary.'; fi

if ! grep -Fq 'ii–V–I at 8th position.' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves focused ii–V–I study did not render.'; fi
if ! grep -Fq 'Focused range · frets 7–11' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves focused fret range did not render.'; fi
if ! grep -Fq 'Open full neck' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves full Fretboard expand link did not render.'; fi
if ! grep -Fq 'Chord voicing' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves shared voicing selector did not render.'; fi
if grep -Fq 'This screen could not load.' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves route reached the application error boundary.'; fi
