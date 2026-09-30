import { config as loadDotenv } from 'dotenv';
import { envSchema } from './env.schema';

// Precedence (highest first): real environment variables (CI secrets), `.env.<TEST_ENV>`, `.env`.
// dotenv never overrides variables that are already set, so loading the specific file first works.
loadDotenv({ path: `.env.${process.env['TEST_ENV'] || 'dev'}`, quiet: true });
loadDotenv({ quiet: true });

// An empty value (`FOO=`) is treated as not set, so required variables cannot pass while blank.
const source = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ''));

const parsed = envSchema.safeParse(source);

if (!parsed.success) {
  // Report names and reasons only. Values are never printed because they may be secrets.
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  throw new Error(
    `Invalid environment configuration. Set the variables below (see .env.example):\n${details}`,
  );
}

const raw = parsed.data;

export interface RoleCredentials {
  readonly username: string;
  readonly password: string;
}

export interface Env {
  readonly testEnv: 'dev' | 'staging' | 'prod-smoke';
  readonly isCI: boolean;
  readonly workers: number | undefined;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
  readonly baseUrl: string;
  readonly api: { readonly baseUrl: string; readonly credentials: RoleCredentials };
  readonly auth: {
    readonly maxAgeMinutes: number;
    /** Roles to authenticate; undefined means all roles in `users`. */
    readonly roles: readonly string[] | undefined;
  };
  /** Credentials per role. The keys of this object are the authenticable roles. */
  readonly users: {
    readonly standard: RoleCredentials;
    readonly problem: RoleCredentials;
  };
}

/** Typed, validated, immutable configuration. The only place `process.env` is read. */
export const env: Env = Object.freeze({
  testEnv: raw.TEST_ENV,
  isCI: raw.CI,
  workers: raw.WORKERS,
  logLevel: raw.LOG_LEVEL,
  baseUrl: raw.BASE_URL,
  api: Object.freeze({
    baseUrl: raw.API_BASE_URL ?? raw.BASE_URL,
    credentials: Object.freeze({ username: raw.API_USERNAME, password: raw.API_PASSWORD }),
  }),
  auth: Object.freeze({ maxAgeMinutes: raw.AUTH_MAX_AGE_MIN, roles: raw.AUTH_ROLES }),
  users: Object.freeze({
    standard: Object.freeze({ username: raw.STANDARD_USERNAME, password: raw.STANDARD_PASSWORD }),
    problem: Object.freeze({ username: raw.PROBLEM_USERNAME, password: raw.PROBLEM_PASSWORD }),
  }),
});

const SECRET_KEY = /pass(word)?|secret|token|api[-_]?key|credential/i;

function redact(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, inner]) => [
      key,
      SECRET_KEY.test(key) && inner !== undefined ? '***' : redact(inner),
    ]),
  );
}

/** A copy of `env` that is safe to log or attach to reports: secret-looking keys are masked. */
export function redactedEnv(): unknown {
  return redact(env);
}
