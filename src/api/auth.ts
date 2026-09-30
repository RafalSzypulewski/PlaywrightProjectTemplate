import type { APIRequestContext } from '@playwright/test';
import { z } from 'zod';
import type { RoleCredentials } from '../../config/env';
import { ApiError } from './api-error';
import { readJson } from './http';

// The demo API answers 200 to both outcomes: { token } on success, { reason } on rejection.
const loginResponseSchema = z.union([
  z.object({ token: z.string() }),
  z.object({ reason: z.string() }),
]);

/** Exchanges credentials for an API token. `request` must not already be authenticated. */
export async function login(
  request: APIRequestContext,
  credentials: RoleCredentials,
): Promise<string> {
  const response = await request.post('/auth', { data: credentials });
  const body = await readJson(response, loginResponseSchema, 'POST /auth');
  if ('reason' in body) {
    throw new ApiError(`Authentication failed: ${body.reason}`, response.status(), response.url());
  }
  return body.token;
}

/** How this API expects the token on authenticated calls. The only place that knows the format. */
export function authHeaders(token: string): Record<string, string> {
  return { Cookie: `token=${token}` };
}
