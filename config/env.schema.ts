import { z } from 'zod';

const isTruthy = (value: string | undefined): boolean =>
  value !== undefined && value !== '' && value !== 'false' && value !== '0';

/**
 * Single source of truth for environment variables: names, types, defaults, required/optional.
 * This file must not read `process.env`; parsing happens in `config/env.ts`.
 *
 * To add a variable: add it here, expose it in `config/env.ts`, and add it to `.env.example`
 * (`npm run check:env` fails if `.env.example` and this schema drift apart).
 *
 * Secrets have no defaults and are masked automatically by `redactedEnv()`.
 */
const requiredString = z.string({ error: 'is required' }).min(1, 'is required');

export const envSchema = z.object({
  TEST_ENV: z.enum(['dev', 'staging', 'prod-smoke']).default('dev'),
  /** Set by CI providers. Any value other than '', 'false' and '0' counts as CI. */
  CI: z.string().optional().transform(isTruthy),
  /** Worker count override. Defaults are defined in playwright.config.ts. */
  WORKERS: z.coerce.number().int().positive().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  BASE_URL: z.url({
    error: (issue) => (issue.input === undefined ? 'is required' : 'must be a valid URL'),
  }),
  /** Defaults to BASE_URL when unset. */
  API_BASE_URL: z.url({ error: 'must be a valid URL' }).optional(),
  /** Credentials for API authentication (separate from the UI roles below). */
  API_USERNAME: requiredString,
  API_PASSWORD: requiredString,

  /** Saved sessions younger than this are reused instead of logging in again. */
  AUTH_MAX_AGE_MIN: z.coerce.number().positive().default(60),
  /** Comma-separated subset of roles to authenticate (default: all). Example: standard,problem */
  AUTH_ROLES: z
    .string()
    .optional()
    .transform((value) =>
      value
        ?.split(',')
        .map((role) => role.trim())
        .filter(Boolean),
    ),

  // One username/password pair per role. Add a pair here (and to `users` in env.ts) per new role.
  STANDARD_USERNAME: requiredString,
  STANDARD_PASSWORD: requiredString,
  PROBLEM_USERNAME: requiredString,
  PROBLEM_PASSWORD: requiredString,
});

export type RawEnv = z.infer<typeof envSchema>;

export { requiredString };
