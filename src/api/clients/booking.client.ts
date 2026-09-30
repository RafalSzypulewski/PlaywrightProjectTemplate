import type { APIRequestContext } from '@playwright/test';
import { ensureOk, readJson } from '../http';
import {
  bookingSchema,
  createdBookingSchema,
  type Booking,
  type CreatedBooking,
} from '../models/booking';

/** Typed access to the booking endpoints. Every method throws ApiError on failure. */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  async create(booking: Booking): Promise<CreatedBooking> {
    const response = await this.request.post('/booking', { data: booking });
    return readJson(response, createdBookingSchema, 'POST /booking');
  }

  async get(id: number): Promise<Booking> {
    const response = await this.request.get(`/booking/${id}`);
    return readJson(response, bookingSchema, `GET /booking/${id}`);
  }

  /** Requires an authenticated context. */
  async delete(id: number): Promise<void> {
    const response = await this.request.delete(`/booking/${id}`);
    await ensureOk(response, `DELETE /booking/${id}`);
  }
}
