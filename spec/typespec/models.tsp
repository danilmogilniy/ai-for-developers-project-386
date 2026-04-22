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
  busyReason?: "BOOKING" | "OWNER_BLOCK";
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

@example(
  #{
    eventTypeId: "event-15",
    windowDays: 14,
    date: plainDate.fromISO("2026-04-23"),
    timezone: "Europe/Moscow",
    workdayStart: "09:00",
    workdayEnd: "18:00",
    slotDurationMinutes: 15,
    items: #[
      #{
        startAt: utcDateTime.fromISO("2026-04-23T06:00:00Z"),
        endAt: utcDateTime.fromISO("2026-04-23T06:15:00Z"),
        isAvailable: true
      },
      #{
        startAt: utcDateTime.fromISO("2026-04-23T06:15:00Z"),
        endAt: utcDateTime.fromISO("2026-04-23T06:30:00Z"),
        isAvailable: false,
        busyReason: "BOOKING"
      },
      #{
        startAt: utcDateTime.fromISO("2026-04-23T06:30:00Z"),
        endAt: utcDateTime.fromISO("2026-04-23T06:45:00Z"),
        isAvailable: true
      },
      #{
        startAt: utcDateTime.fromISO("2026-04-23T06:45:00Z"),
        endAt: utcDateTime.fromISO("2026-04-23T07:00:00Z"),
        isAvailable: false,
        busyReason: "OWNER_BLOCK"
      }
    ]
  },
  #{
    title: "slots15MinutesBase",
    description: "Workday 09:00-18:00 example with 15-minute slots and busy intervals."
  }
)
model SlotListResponse {
  eventTypeId: string;
  windowDays: int32;
  date: plainDate;
  timezone: string;
  workdayStart: string;
  workdayEnd: string;
  slotDurationMinutes: int32;
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

model UpdateEventTypeRequest {
  title?: string;
  description?: string;
  durationMinutes?: int32;
}

model DeleteEventTypeResponse {
  id: string;
}

model CreateBookingRequest {
  eventTypeId: string;
  startAt: utcDateTime;
  guest: GuestContact;
}
