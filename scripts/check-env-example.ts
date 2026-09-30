import { readFileSync } from 'node:fs';
import { envSchema } from '../config/env.schema';

// Verifies .env.example and the schema list the same variables:
// - every schema variable appears in .env.example (commented-out is fine for optional ones)
// - every uncommented variable in .env.example exists in the schema
const schemaKeys = new Set(Object.keys(envSchema.shape));
const lines = readFileSync('.env.example', 'utf8').split(/\r?\n/);

const documented = new Set<string>();
const active = new Set<string>();
for (const line of lines) {
  const match = /^(#\s*)?([A-Z][A-Z0-9_]*)=/.exec(line);
  if (!match?.[2]) continue;
  documented.add(match[2]);
  if (!match[1]) active.add(match[2]);
}

const missing = [...schemaKeys].filter((key) => !documented.has(key));
const unknown = [...active].filter((key) => !schemaKeys.has(key));

if (missing.length > 0 || unknown.length > 0) {
  if (missing.length > 0) console.error(`Missing from .env.example: ${missing.join(', ')}`);
  if (unknown.length > 0) console.error(`Not in env.schema.ts: ${unknown.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('.env.example is in sync with config/env.schema.ts');
}
