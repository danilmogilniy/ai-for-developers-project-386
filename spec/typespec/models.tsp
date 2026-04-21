namespace CallCalendar;

model OwnerProfile {
  id: string;
  displayName: string;
  email: string;
}

model EventType {
  id: string;
  title: string;
  description?: string;
  durationMinutes: int32;
}

model Slot {
  startAt: utcDateTime;
  endAt: utcDateTime;
  isAvailable: boolean;
}

model GuestContact {
  name: string;
  email: string;
  note?: string;
}

model Booking {
  id: string;
  eventTypeId: string;
  eventTypeTitle: string;
  startAt: utcDateTime;
  endAt: utcDateTime;
  guest: GuestContact;
  createdAt: utcDateTime;
}

model EventTypeListResponse {
  items: EventType[];
  total: int32;
}

model SlotListResponse {
  eventTypeId: string;
  windowDays: int32;
  items: Slot[];
}

model BookingListResponse {
  items: Booking[];
  total: int32;
}

model CreateEventTypeRequest {
  title: string;
  description?: string;
  durationMinutes: int32;
}

model CreateBookingRequest {
  eventTypeId: string;
  startAt: utcDateTime;
  guest: GuestContact;
}
