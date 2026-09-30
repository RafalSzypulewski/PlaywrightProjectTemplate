import type { Booking } from '../api/models/booking';
import { unique } from './unique';

/** A valid booking with a unique guest name, so tests never collide on shared data. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: unique('guest'),
    lastname: 'Automation',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2026-10-01', checkout: '2026-10-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
