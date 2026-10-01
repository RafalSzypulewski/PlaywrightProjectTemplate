import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

// Every test must carry exactly one type tag, @regression (plus @smoke for the critical path), and
// only known tags, so a typo (e.g. @smok) cannot silently drop a test from a tagged run. Setup
// tests are exempt.
const TYPE_TAGS = ['@e2e', '@api'];
const SCOPE_TAGS = ['@smoke', '@regression'];
// Optional tags. @destructive marks tests that create or change data; read-only runs exclude it.
const TRAIT_TAGS = ['@destructive'];
const KNOWN = new Set([...TYPE_TAGS, ...SCOPE_TAGS, ...TRAIT_TAGS]);

interface Spec {
  file: string;
  title: string;
  tags?: string[];
}
interface Suite {
  specs?: Spec[];
  suites?: Suite[];
}

const playwrightCli = createRequire(import.meta.url).resolve('@playwright/test/cli');
const output = execFileSync(
  process.execPath,
  [playwrightCli, 'test', '--list', '--reporter=json'],
  {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  },
);
const report = JSON.parse(output.slice(output.indexOf('{'))) as { suites: Suite[] };

const specs = new Map<string, Spec>();
const collect = (suite: Suite): void => {
  for (const spec of suite.specs ?? []) specs.set(`${spec.file} › ${spec.title}`, spec);
  for (const child of suite.suites ?? []) collect(child);
};
report.suites.forEach(collect);

const problems: string[] = [];
for (const [name, spec] of specs) {
  if (/^setup[\\/]/.test(spec.file)) continue;
  // Playwright reports tags without the leading '@'.
  const tags = (spec.tags ?? []).map((tag) => `@${tag}`);
  const unknown = tags.filter((tag) => !KNOWN.has(tag));
  const types = tags.filter((tag) => TYPE_TAGS.includes(tag));

  if (unknown.length > 0) problems.push(`${name}: unknown tag(s) ${unknown.join(', ')}`);
  if (types.length !== 1) problems.push(`${name}: needs exactly one of ${TYPE_TAGS.join(' / ')}`);
  // Smoke tests are a subset of regression, so @regression is required either way.
  if (!tags.includes('@regression'))
    problems.push(`${name}: needs @regression (and @smoke if it is a smoke test)`);
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`All ${specs.size} tests carry valid tags`);
}
