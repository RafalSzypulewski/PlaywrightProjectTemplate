import { randomUUID } from 'node:crypto';
import type { Booking } from '../api/models/booking';

/** A valid booking with unique names, so tests never collide on shared data. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const unique = randomUUID().slice(0, 8);
  return {
    firstname: `Test-${unique}`,
    lastname: 'Automation',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2026-10-01', checkout: '2026-10-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
