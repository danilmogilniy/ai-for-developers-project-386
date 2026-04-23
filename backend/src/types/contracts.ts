export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "BOOKING_WINDOW_EXCEEDED"
  | "SLOT_ALREADY_BOOKED";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: string;
}

export interface GuestContact {
  name: string;
  email: string;
  note?: string;
}

export interface EventType {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
}

export interface EventTypeListResponse {
  items: EventType[];
  total: number;
}

export interface CreateEventTypeRequest {
  title: string;
  description?: string;
  durationMinutes: number;
}

export interface UpdateEventTypeRequest {
  title?: string;
  description?: string;
  durationMinutes?: number;
}

export interface DeleteEventTypeResponse {
  id: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  eventTypeTitle: string;
  /** ISO 8601 date-time with explicit timezone offset (example: +03:00). */
  startAt: string;
  /** ISO 8601 date-time with explicit timezone offset (example: +03:00). */
  endAt: string;
  guest: GuestContact;
  /** ISO 8601 date-time with explicit timezone offset (example: +03:00). */
  createdAt: string;
}

export interface BookingListResponse {
  items: Booking[];
  total: number;
}

export interface CreateBookingRequest {
  eventTypeId: string;
  /** ISO 8601 date-time with explicit timezone offset (example: +03:00). */
  startAt: string;
  guest: GuestContact;
}

export type BusyReason = "BOOKING" | "OWNER_BLOCK";

export interface Slot {
  /** ISO 8601 date-time with explicit timezone offset (example: +03:00). */
  startAt: string;
  /** ISO 8601 date-time with explicit timezone offset (example: +03:00). */
  endAt: string;
  isAvailable: boolean;
  busyReason?: BusyReason;
}

export interface SlotListResponse {
  eventTypeId: string;
  windowDays: number;
  date: string;
  timezone: string;
  workdayStart: string;
  workdayEnd: string;
  slotDurationMinutes: number;
  items: Slot[];
}

export interface OwnerProfile {
  id: string;
  displayName: string;
  email: string;
}

export interface OwnerBusyInterval {
  startMs: number;
  endMs: number;
  busyReason: BusyReason;
}

export interface OwnerBlock {
  id: string;
  startAt: string;
  endAt: string;
}
