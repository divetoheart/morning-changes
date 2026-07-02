import { build } from 'vite';
import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const outDir = path.join(appRoot, '.music-contract-dist');

try {
  await rm(outDir, { recursive: true, force: true });

  await build({
    root: appRoot,
    configFile: false,
    logLevel: 'error',
    build: {
      outDir,
      emptyOutDir: true,
      lib: {
        entry: path.join(appRoot, 'src/lib/music/run-contract.ts'),
        formats: ['es'],
        fileName: 'music-contract'
      }
    }
  });

  const entry = (await readdir(outDir)).find(file => /\.(?:m?js)$/.test(file));
  if (!entry) throw new Error('Music engine contract bundle was not produced.');
  await import(`${pathToFileURL(path.join(outDir, entry)).href}?run=${Date.now()}`);
} finally {
  await rm(outDir, { recursive: true, force: true });
}
