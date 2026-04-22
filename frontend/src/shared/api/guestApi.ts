import { requestJson } from './httpClient'
import type {
  CreateBookingRequest,
  EventTypeListResponse,
  Booking,
  NotFoundError,
  OutOfWindowError,
  SlotConflictError,
  SlotListResponse,
  ValidationError,
} from './types'

export type SlotListResult = SlotListResponse | ValidationError | NotFoundError
export type CreateBookingResult =
  | Booking
  | ValidationError
  | NotFoundError
  | OutOfWindowError
  | SlotConflictError

export const listEventTypes = async (): Promise<EventTypeListResponse> =>
  requestJson<EventTypeListResponse>('/api/guest/event-types')

export const listAvailableSlots = async (
  eventTypeId: string,
  date: string,
  windowDays = 14,
): Promise<SlotListResult> =>
  requestJson<SlotListResult>(
    `/api/guest/event-types/${encodeURIComponent(eventTypeId)}/slots?date=${encodeURIComponent(date)}&windowDays=${windowDays}`,
  )

export const createBooking = async (payload: CreateBookingRequest): Promise<CreateBookingResult> =>
  requestJson<CreateBookingResult>('/api/guest/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
