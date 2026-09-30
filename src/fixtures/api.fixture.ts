import type { APIRequestContext } from '@playwright/test';
import { ApiError } from '../api/api-error';
import { authHeaders, login } from '../api/auth';
import { BookingClient } from '../api/clients/booking.client';
import type { Booking, CreatedBooking } from '../api/models/booking';
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
    createBooking: (overrides?: Partial<Booking>) => Promise<CreatedBooking>;
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
   * Creates bookings on demand (with optional overrides) and deletes every one after the test.
   * Copy this shape for other entities: create through the client, track, delete in teardown.
   */
  createBooking: async ({ bookingClient }, use) => {
    const created: CreatedBooking[] = [];
    await use(async (overrides) => {
      const booking = await bookingClient.create(buildBooking(overrides));
      created.push(booking);
      return booking;
    });

    // Try every delete even if one fails. A test may have deleted its record already, which this
    // API reports as 404 or 405; any other failure is a leak and fails the test.
    const results = await Promise.allSettled(
      created.map((booking) => bookingClient.delete(booking.bookingid)),
    );
    const leaks = results.flatMap((result) =>
      result.status === 'rejected' && !isAlreadyGone(result.reason)
        ? [result.reason as unknown]
        : [],
    );
    if (leaks.length > 0) throw new AggregateError(leaks, 'Test data cleanup failed');
  },

  /** One default booking for tests that just need a record to exist. */
  booking: async ({ createBooking }, use) => {
    await use(await createBooking());
  },
});

function isAlreadyGone(error: unknown): boolean {
  return error instanceof ApiError && [404, 405].includes(error.status);
}
