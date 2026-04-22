import { requestJson } from './httpClient'
import type {
  BookingListResponse,
  CreateEventTypeRequest,
  DeleteEventTypeResponse,
  EventType,
  EventTypeListResponse,
  NotFoundError,
  OwnerProfile,
  UpdateEventTypeRequest,
  ValidationError,
} from './types'

export type CreateEventTypeResult = EventType | ValidationError
export type UpdateEventTypeResult = EventType | ValidationError | NotFoundError
export type DeleteEventTypeResult = DeleteEventTypeResponse | NotFoundError

export const getOwnerProfile = async (): Promise<OwnerProfile> =>
  requestJson<OwnerProfile>('/api/owner/profile')

export const listUpcomingBookings = async (): Promise<BookingListResponse> =>
  requestJson<BookingListResponse>('/api/owner/bookings/upcoming')

export const listOwnerEventTypes = async (): Promise<EventTypeListResponse> =>
  requestJson<EventTypeListResponse>('/api/owner/event-types')

export const createEventType = async (
  payload: CreateEventTypeRequest,
): Promise<CreateEventTypeResult> =>
  requestJson<CreateEventTypeResult>('/api/owner/event-types', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateEventType = async (
  eventTypeId: string,
  payload: UpdateEventTypeRequest,
): Promise<UpdateEventTypeResult> =>
  requestJson<UpdateEventTypeResult>(`/api/owner/event-types/${encodeURIComponent(eventTypeId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const deleteEventType = async (eventTypeId: string): Promise<DeleteEventTypeResult> =>
  requestJson<DeleteEventTypeResult>(`/api/owner/event-types/${encodeURIComponent(eventTypeId)}`, {
    method: 'DELETE',
  })
