import { build } from 'vite';
import { readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const outDir = path.join(appRoot, '.music-contract-dist');
const reportPath = path.join(appRoot, '.music-contract-report.json');

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
  const module = await import(`${pathToFileURL(path.join(outDir, entry)).href}?run=${Date.now()}`);
  const result = module.musicEngineContractResult;
  if (!result || !Array.isArray(result.cases)) throw new Error('Music engine contract bundle did not export a result.');

  await writeFile(reportPath, `${JSON.stringify(result, null, 2)}\n`);
  for (const test of result.cases) {
    if (test.passed) continue;
    console.error(`FAIL ${test.id}\n  expected: ${test.expected}\n  received: ${test.actual}`);
  }
  if (!result.passed) throw new Error(`Music engine contract failed: ${result.cases.filter(test => !test.passed).length} failing case(s).`);
  console.log(`Music engine contract passed: ${result.cases.length} cases.`);
} finally {
  await rm(outDir, { recursive: true, force: true });
}
