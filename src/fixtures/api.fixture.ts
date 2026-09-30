import type { APIRequestContext } from '@playwright/test';
import { ApiError } from '../api/api-error';
import { authHeaders, login } from '../api/auth';
import { BookingClient } from '../api/clients/booking.client';
import type { CreatedBooking } from '../api/models/booking';
import { buildBooking } from '../data/booking.factory';
import { envTest } from './env.fixture';

const JSON_HEADERS = { Accept: 'application/json' };

/**
 * API fixtures. Contexts are created on demand and disposed after each test, so UI tests that do
 * not request them never pay for an API login. The token is worker-scoped and kept in memory.
 */
export const apiTest = envTest.extend<
  {
    anonymousApi: APIRequestContext;
    apiRequest: APIRequestContext;
    bookingClient: BookingClient;
    booking: CreatedBooking;
  },
  { apiToken: string }
>({
  apiToken: [
    async ({ playwright, env }, use) => {
      const request = await playwright.request.newContext({
        baseURL: env.api.baseUrl,
        extraHTTPHeaders: JSON_HEADERS,
      });
      const token = await login(request, env.api.credentials).finally(() => request.dispose());
      await use(token);
    },
    { scope: 'worker' },
  ],

  /** No credentials: for public endpoints and for testing authentication itself. */
  anonymousApi: async ({ playwright, env }, use) => {
    const request = await playwright.request.newContext({
      baseURL: env.api.baseUrl,
      extraHTTPHeaders: JSON_HEADERS,
    });
    await use(request);
    await request.dispose();
  },

  /** Signed in with the worker's API token. A native APIRequestContext, nothing wrapped. */
  apiRequest: async ({ playwright, env, apiToken }, use) => {
    const request = await playwright.request.newContext({
      baseURL: env.api.baseUrl,
      extraHTTPHeaders: { ...JSON_HEADERS, ...authHeaders(apiToken) },
    });
    await use(request);
    await request.dispose();
  },

  bookingClient: async ({ apiRequest }, use) => {
    await use(new BookingClient(apiRequest));
  },

  /**
   * Test data created through the API and removed afterwards. Usable from any test, UI or API:
   * request `booking` to get a known record without touching the UI.
   */
  booking: async ({ bookingClient }, use) => {
    const created = await bookingClient.create(buildBooking());
    await use(created);
    try {
      await bookingClient.delete(created.bookingid);
    } catch (error) {
      // The test may have deleted it already; this API answers 404 or 405 for unknown ids.
      const alreadyGone = error instanceof ApiError && [404, 405].includes(error.status);
      if (!alreadyGone) throw error;
    }
  },
});
