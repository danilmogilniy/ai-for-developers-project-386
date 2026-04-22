import type { components } from './openapi'

export type ApiError = components['schemas']['ApiError']
export type ValidationError = components['schemas']['ValidationError']
export type NotFoundError = components['schemas']['NotFoundError']
export type OutOfWindowError = components['schemas']['OutOfWindowError']
export type SlotConflictError = components['schemas']['SlotConflictError']

export type EventType = components['schemas']['EventType']
export type EventTypeListResponse = components['schemas']['EventTypeListResponse']
export type Slot = components['schemas']['Slot']
export type SlotListResponse = components['schemas']['SlotListResponse']
export type Booking = components['schemas']['Booking']
export type BookingListResponse = components['schemas']['BookingListResponse']
export type OwnerProfile = components['schemas']['OwnerProfile']

export type CreateBookingRequest = components['schemas']['CreateBookingRequest']
export type CreateEventTypeRequest = components['schemas']['CreateEventTypeRequest']
export type UpdateEventTypeRequest = components['schemas']['UpdateEventTypeRequest']
export type DeleteEventTypeResponse = components['schemas']['DeleteEventTypeResponse']
