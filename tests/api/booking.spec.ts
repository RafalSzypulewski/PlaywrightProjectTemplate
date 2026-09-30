import { login } from '../../src/api/auth';
import { expect, test } from '../../src/fixtures';

test.describe('booking API', { tag: '@api' }, () => {
  test('a created booking can be retrieved by id', async ({ bookingClient, booking }) => {
    const retrieved = await bookingClient.get(booking.bookingid);

    expect(retrieved).toEqual(booking.booking);
  });

  test('a deleted booking is no longer found', async ({ bookingClient, booking }) => {
    await bookingClient.delete(booking.bookingid);

    await expect(bookingClient.get(booking.bookingid)).rejects.toMatchObject({ status: 404 });
  });

  test('login with wrong credentials fails with a clear error', async ({ anonymousApi, env }) => {
    const wrong = { ...env.api.credentials, password: 'wrong-password' };

    await expect(login(anonymousApi, wrong)).rejects.toThrow(
      'Authentication failed: Bad credentials',
    );
  });
});
