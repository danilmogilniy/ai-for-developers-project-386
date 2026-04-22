namespace CallCalendar;

model ApiError {
  code: string;
  message: string;
  details?: string;
}

model ValidationError extends ApiError {
  code: "VALIDATION_ERROR";
}

/**
 * Conflict means the requested interval overlaps with any owner busy interval
 * (including existing bookings and owner-defined blocks), regardless of event type.
 */
model SlotConflictError extends ApiError {
  code: "SLOT_ALREADY_BOOKED";
}

model OutOfWindowError extends ApiError {
  code: "BOOKING_WINDOW_EXCEEDED";
}

model NotFoundError extends ApiError {
  code: "NOT_FOUND";
}
