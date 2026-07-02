const BUILD_COMMIT = import.meta.env.VITE_APP_COMMIT_SHA?.trim() || 'local';
const SHORT_COMMIT = BUILD_COMMIT.slice(0, 7);
const COMMIT_HREF = BUILD_COMMIT === 'local' ? undefined : `https://github.com/divetoheart/morning-changes/commit/${BUILD_COMMIT}`;

/**
 * Visible deployment provenance. The Pages workflow injects VITE_APP_COMMIT_SHA,
 * so this reflects the commit that produced the live bundle.
 */
export function BuildFooter() {
  return (
    <footer className="build-footer" aria-label="Live build information">
      <span>Live build</span>
      {COMMIT_HREF ? <a href={COMMIT_HREF} target="_blank" rel="noreferrer">{SHORT_COMMIT}</a> : <code>{SHORT_COMMIT}</code>}
      <span className="build-footer-copy">Check this commit after an update.</span>
    </footer>
  );
}
