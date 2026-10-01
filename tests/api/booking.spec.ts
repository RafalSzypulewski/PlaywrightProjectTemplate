import { login } from '../../src/api/auth';
import { expect, test } from '../../src/fixtures';

test.describe('booking API', { tag: ['@api', '@regression'] }, () => {
  // Tests that create bookings are @destructive, so read-only runs (prod-smoke) can exclude them.
  test(
    'a created booking can be retrieved by id',
    { tag: ['@smoke', '@destructive'] },
    async ({ bookingClient, booking }) => {
      const retrieved = await bookingClient.get(booking.bookingid);

      expect(retrieved).toEqual(booking.booking);
    },
  );

  test(
    'bookings created with overrides are stored independently',
    { tag: '@destructive' },
    async ({ bookingClient, createBooking }) => {
      const cheap = await createBooking({ totalprice: 100 });
      const pricey = await createBooking({ totalprice: 200 });

      expect(cheap.bookingid).not.toBe(pricey.bookingid);
      expect((await bookingClient.get(cheap.bookingid)).totalprice).toBe(100);
      expect((await bookingClient.get(pricey.bookingid)).totalprice).toBe(200);
    },
  );

  test(
    'a deleted booking is no longer found',
    { tag: '@destructive' },
    async ({ bookingClient, booking }) => {
      await bookingClient.delete(booking.bookingid);

      await expect(bookingClient.get(booking.bookingid)).rejects.toMatchObject({ status: 404 });
    },
  );

  test('login with wrong credentials fails with a clear error', async ({ anonymousApi, env }) => {
    const wrong = { ...env.api.credentials, password: 'wrong-password' };

    await expect(login(anonymousApi, wrong)).rejects.toThrow(
      'Authentication failed: Bad credentials',
    );
  });
});
