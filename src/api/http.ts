import type { APIResponse } from '@playwright/test';
import type { ZodType } from 'zod';
import { ApiError } from './api-error';

const MAX_BODY_CHARS = 500;

/** Throws an ApiError naming the call, status and (truncated) body unless the response is 2xx. */
export async function ensureOk(response: APIResponse, action: string): Promise<void> {
  if (response.ok()) return;
  const body = (await response.text()).slice(0, MAX_BODY_CHARS);
  throw new ApiError(
    `${action} failed: ${response.status()} ${response.statusText()} (${response.url()})\n${body}`,
    response.status(),
    response.url(),
  );
}

/** Checks the status, then parses the JSON body against `schema` so models are trustworthy. */
export async function readJson<T>(
  response: APIResponse,
  schema: ZodType<T>,
  action: string,
): Promise<T> {
  await ensureOk(response, action);
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new ApiError(
      `${action}: response does not match the expected shape (${issues})`,
      response.status(),
      response.url(),
    );
  }
  return parsed.data;
}
