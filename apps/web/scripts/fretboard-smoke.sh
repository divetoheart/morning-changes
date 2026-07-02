#!/usr/bin/env bash
set -euo pipefail

git rev-parse HEAD^{tree} > "$RUNNER_TEMP/git-tree.sha"
VITE_APP_COMMIT_SHA="${VITE_APP_COMMIT_SHA:-${GITHUB_SHA:-local}}" npm run build
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

"$browser" --headless --no-sandbox --disable-gpu --disable-dev-shm-usage --virtual-time-budget=5000 --dump-dom 'http://127.0.0.1:4173/#/' > "$RUNNER_TEMP/home.html"
"$browser" --headless --no-sandbox --disable-gpu --disable-dev-shm-usage --virtual-time-budget=5000 --dump-dom 'http://127.0.0.1:4173/#/fretboard' > "$RUNNER_TEMP/fretboard.html"
"$browser" --headless --no-sandbox --disable-gpu --disable-dev-shm-usage --virtual-time-budget=5000 --dump-dom 'http://127.0.0.1:4173/#/after-hours/autumn-leaves' > "$RUNNER_TEMP/autumn-leaves.html"
"$browser" --headless --no-sandbox --disable-gpu --disable-dev-shm-usage --virtual-time-budget=5000 --dump-dom 'http://127.0.0.1:4173/#/after-hours/12-bar-blues' > "$RUNNER_TEMP/blues.html"

fail() {
  echo "$1"
  echo '--- Home DOM ---'
  cat "$RUNNER_TEMP/home.html"
  echo '--- Fretboard DOM ---'
  cat "$RUNNER_TEMP/fretboard.html"
  echo '--- Autumn Leaves DOM ---'
  cat "$RUNNER_TEMP/autumn-leaves.html"
  echo '--- Blues DOM ---'
  cat "$RUNNER_TEMP/blues.html"
  echo '--- Preview server log ---'
  cat "$RUNNER_TEMP/fretboard-preview.log"
  exit 1
}

if ! grep -Fq ':root[data-theme] .after-hours-topbar .wordmark-mark.after-hours-wordmark-mark' src/after-hours-wordmark.css; then fail 'After Hours mark is not protected from theme overrides.'; fi
if ! grep -Fq 'background:#050505' src/after-hours-wordmark.css; then fail 'After Hours mark no longer has a fixed dark background.'; fi
if ! grep -Fq 'border:2px solid #fff' src/after-hours-wordmark.css; then fail 'After Hours mark no longer has a fixed white ring.'; fi

if ! grep -Fq 'Core spaces' "$RUNNER_TEMP/home.html"; then fail 'Core home screen did not render.'; fi
if ! grep -Fq '12-Bar Blues' "$RUNNER_TEMP/home.html"; then fail 'Restored Blues language did not render on Home.'; fi
if grep -Fq 'Daily lick' "$RUNNER_TEMP/home.html"; then fail 'Legacy daily lick content remains on Home.'; fi
if grep -Fq 'Daily exercise' "$RUNNER_TEMP/home.html"; then fail 'Legacy daily exercise content remains on Home.'; fi
if grep -Fq 'Start session' "$RUNNER_TEMP/home.html"; then fail 'Legacy daily lesson content remains on Home.'; fi
if grep -Fq 'Practice path' "$RUNNER_TEMP/home.html"; then fail 'Legacy learning-path content remains on Home.'; fi
if ! grep -Fq 'Live build' "$RUNNER_TEMP/home.html"; then fail 'Home did not render the live build footer.'; fi
if grep -Fq 'This screen could not load.' "$RUNNER_TEMP/home.html"; then fail 'Home route reached the application error boundary.'; fi

if ! grep -Fq 'Explore the neck.' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard heading did not render.'; fi
if ! grep -Fq 'all fifteen key signatures' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard fifteen-key guidance did not render.'; fi
if ! grep -Fq 'ah-fretboard-key-interactive' "$RUNNER_TEMP/fretboard.html"; then fail 'Interactive study key did not render inside the Fretboard surface.'; fi
if ! grep -Fq 'ah-fretboard-key-controls' "$RUNNER_TEMP/fretboard.html"; then fail 'Study key controls did not render inside the study key card.'; fi
if grep -Fq 'class="interval-panel"' "$RUNNER_TEMP/fretboard.html"; then fail 'Standalone study key panel remains outside the Fretboard surface.'; fi
if ! grep -Fq '>C♯<' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard sharp key option did not render.'; fi
if ! grep -Fq '>C♭<' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard flat key option did not render.'; fi
if ! grep -Fq '>Major<' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard major mode option did not render.'; fi
if ! grep -Fq '>Minor<' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard minor mode option did not render.'; fi
if ! grep -Fq 'Build what you want to inspect.' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard chord builder did not render.'; fi
if ! grep -Fq 'Type a symbol' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard chord symbol builder did not render.'; fi
if ! grep -Fq 'Build from tones' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard tone builder did not render.'; fi
if ! grep -Fq 'Tap any marker to see what it means in plain English.' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard English detail guidance did not render.'; fi
if ! grep -Fq 'ah-fretboard-customizer' "$RUNNER_TEMP/fretboard.html"; then fail 'Shared Fretboard renderer did not render.'; fi
if ! grep -Fq '>Triads<' "$RUNNER_TEMP/fretboard.html"; then fail 'Triad layer control did not render.'; fi
if ! grep -Fq 'Triad inversion' "$RUNNER_TEMP/fretboard.html"; then fail 'Triad inversion control did not render.'; fi
if ! grep -Fq 'Chord voicing' "$RUNNER_TEMP/fretboard.html"; then fail 'Chord voicing selector did not render.'; fi
if ! grep -Fq 'Drop 2' "$RUNNER_TEMP/fretboard.html"; then fail 'Drop 2 selector option did not render.'; fi
if ! grep -Fq 'Live build' "$RUNNER_TEMP/fretboard.html"; then fail 'Visible live build footer did not render.'; fi
if grep -Fq 'This screen could not load.' "$RUNNER_TEMP/fretboard.html"; then fail 'Fretboard route reached the application error boundary.'; fi

if ! grep -Fq 'After Hours' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'After Hours wordmark did not render.'; fi
if ! grep -Fq 'Standards Library' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'After Hours wordmark subtitle did not render.'; fi
if ! grep -Fq 'after-hours-wordmark-mark' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'After Hours circular wordmark state did not render.'; fi
if ! grep -Fq 'Apply this in Autumn Leaves' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves focused study eyebrow did not render.'; fi
if ! grep -Fq 'at 8th position.' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves focused position title did not render.'; fi
if ! grep -Fq 'Focused fretboard from fret 7 to 11' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves focused fret range did not render.'; fi
if ! grep -Fq 'Open full neck' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves full Fretboard expand link did not render.'; fi
if ! grep -Fq 'Chord voicing' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves shared voicing selector did not render.'; fi
if ! grep -Fq 'Live build' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves did not render the live build footer.'; fi
if grep -Fq 'This screen could not load.' "$RUNNER_TEMP/autumn-leaves.html"; then fail 'Autumn Leaves route reached the application error boundary.'; fi

if ! grep -Fq '12-Bar Blues' "$RUNNER_TEMP/blues.html"; then fail '12-Bar Blues route did not render.'; fi
if ! grep -Fq 'Texas Flood' "$RUNNER_TEMP/blues.html"; then fail 'Texas Flood Blues variant did not render.'; fi
if ! grep -Fq 'Crossroads' "$RUNNER_TEMP/blues.html"; then fail 'Crossroads Blues variant did not render.'; fi
if ! grep -Fq 'The Thrill Is Gone' "$RUNNER_TEMP/blues.html"; then fail 'The Thrill Is Gone Blues variant did not render.'; fi
if ! grep -Fq 'Live build' "$RUNNER_TEMP/blues.html"; then fail 'Blues route did not render the live build footer.'; fi
if grep -Fq 'This screen could not load.' "$RUNNER_TEMP/blues.html"; then fail 'Blues route reached the application error boundary.'; fi
