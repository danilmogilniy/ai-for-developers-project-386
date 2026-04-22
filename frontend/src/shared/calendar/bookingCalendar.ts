import type { EventInput } from '@fullcalendar/core'
import type { Booking } from '../api/types'

export type BookingEventMeta = {
  bookingId: string
  eventTypeId: string
  eventTypeTitle: string
  guestName: string
  guestEmail: string
  guestNote?: string
  createdAt: string
}

export type BookingCalendarEvent = EventInput & {
  extendedProps: BookingEventMeta
}

export const mapBookingToCalendarEvent = (booking: Booking): BookingCalendarEvent => ({
  id: booking.id,
  title: booking.eventTypeTitle,
  start: booking.startAt,
  end: booking.endAt,
  allDay: false,
  extendedProps: {
    bookingId: booking.id,
    eventTypeId: booking.eventTypeId,
    eventTypeTitle: booking.eventTypeTitle,
    guestName: booking.guest.name,
    guestEmail: booking.guest.email,
    guestNote: booking.guest.note,
    createdAt: booking.createdAt,
  },
})

export const mapBookingsToCalendarEvents = (bookings: Booking[]): BookingCalendarEvent[] =>
  bookings.map(mapBookingToCalendarEvent)
