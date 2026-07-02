import { evaluateMusicEngineContract } from './contract';

const result = evaluateMusicEngineContract();

for (const test of result.cases) {
  if (test.passed) continue;
  console.error(`FAIL ${test.id}\n  expected: ${test.expected}\n  received: ${test.actual}`);
}

if (!result.passed) {
  throw new Error(`Music engine contract failed: ${result.cases.filter(test => !test.passed).length} failing case(s).`);
}

console.log(`Music engine contract passed: ${result.cases.length} cases.`);
