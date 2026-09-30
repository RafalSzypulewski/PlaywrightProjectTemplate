import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

// Load `.env.<TEST_ENV>` first, then `.env`. dotenv never overrides variables that are already set,
// so real environment variables (e.g. CI secrets) always win, then the env-specific file.
const testEnv = process.env['TEST_ENV'] ?? 'dev';
loadDotenv({ path: `.env.${testEnv}`, quiet: true });
loadDotenv({ quiet: true });

const schema = z.object({
  TEST_ENV: z.enum(['dev', 'staging', 'prod-smoke']).default('dev'),
  BASE_URL: z.url(),
  WORKERS: z.coerce.number().int().positive().optional(),
  CI: z
    .string()
    .optional()
    .transform(
      (value) => value !== undefined && value !== '' && value !== 'false' && value !== '0',
    ),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration (see .env.example):\n${details}`);
}

/** Typed, validated environment. The only place `process.env` is read. */
export const env = {
  testEnv: parsed.data.TEST_ENV,
  baseUrl: parsed.data.BASE_URL,
  workers: parsed.data.WORKERS,
  isCI: parsed.data.CI,
};
