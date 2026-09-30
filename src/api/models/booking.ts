import { z } from 'zod';

export const bookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: z.object({ checkin: z.string(), checkout: z.string() }),
  additionalneeds: z.string().optional(),
});
export type Booking = z.infer<typeof bookingSchema>;

export const createdBookingSchema = z.object({ bookingid: z.number(), booking: bookingSchema });
export type CreatedBooking = z.infer<typeof createdBookingSchema>;
