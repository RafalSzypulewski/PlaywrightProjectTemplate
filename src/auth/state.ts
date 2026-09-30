import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { env } from '../../config/env';

/** Authenticable roles: the keys of `env.users`. To add a role, add it to the env schema and env.ts. */
export type Role = keyof typeof env.users;
export const roles = Object.keys(env.users) as Role[];

/** A saved session with a cookie expiring sooner than this is treated as stale (a run needs time). */
const EXPIRY_MARGIN_SECONDS = 300;

/**
 * Where a role's saved session (Playwright storageState) lives. The file holds live session tokens:
 * it is gitignored and must never be uploaded as a CI artifact. Scoped by TEST_ENV so sessions
 * from one environment are never reused against another.
 */
export function authFile(role: Role): string {
  return path.resolve('.auth', env.testEnv, `${role}.json`);
}

/**
 * True when the role's saved session exists, is younger than `maxAgeMinutes`, and none of its
 * cookies expire within the margin. Checks only what the file can tell us: a server that
 * invalidates sessions early, or a token in localStorage, is not detected.
 */
export function hasFreshState(role: Role, maxAgeMinutes: number): boolean {
  try {
    const file = authFile(role);
    if (Date.now() - statSync(file).mtimeMs >= maxAgeMinutes * 60_000) return false;

    const state = JSON.parse(readFileSync(file, 'utf8')) as { cookies?: { expires: number }[] };
    const nowSeconds = Date.now() / 1000;
    return (state.cookies ?? []).every(
      (cookie) => cookie.expires <= 0 || cookie.expires - nowSeconds > EXPIRY_MARGIN_SECONDS,
    );
  } catch {
    return false;
  }
}
