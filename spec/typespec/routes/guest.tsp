import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace CallCalendar;

@tag("Guest")
@route("/api/guest")
interface GuestApi {
  @opExample(
    #{
      returnType: #{
        items: #[
          #{
            id: "event-15",
            title: "Quick Sync",
            description: "Short 15-minute check-in.",
            durationMinutes: 15
          },
          #{
            id: "event-30",
            title: "Discovery Call",
            description: "Standard 30-minute conversation.",
            durationMinutes: 30
          },
          #{
            id: "event-60",
            title: "Deep Dive",
            description: "Extended 60-minute session.",
            durationMinutes: 60
          }
        ],
        total: 3
      }
    },
    #{ title: "eventTypesBase", description: "Three base event types with fixed durations." }
  )
  @get
  @route("/event-types")
  listEventTypes(): EventTypeListResponse;

  @opExample(
    #{
      returnType: #{
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
      }
    },
    #{
      title: "slots15Minutes",
      description: "Workday 09:00-18:00 with 15-minute slots and mixed busy intervals."
    }
  )
  @opExample(
    #{
      returnType: #{
        eventTypeId: "event-30",
        windowDays: 14,
        date: plainDate.fromISO("2026-04-24"),
        timezone: "Europe/Moscow",
        workdayStart: "09:00",
        workdayEnd: "18:00",
        slotDurationMinutes: 30,
        items: #[
          #{
            startAt: utcDateTime.fromISO("2026-04-24T06:00:00Z"),
            endAt: utcDateTime.fromISO("2026-04-24T06:30:00Z"),
            isAvailable: true
          },
          #{
            startAt: utcDateTime.fromISO("2026-04-24T06:30:00Z"),
            endAt: utcDateTime.fromISO("2026-04-24T07:00:00Z"),
            isAvailable: false,
            busyReason: "BOOKING"
          },
          #{
            startAt: utcDateTime.fromISO("2026-04-24T07:00:00Z"),
            endAt: utcDateTime.fromISO("2026-04-24T07:30:00Z"),
            isAvailable: true
          }
        ]
      }
    },
    #{
      title: "slots30Minutes",
      description: "Workday 09:00-18:00 with 30-minute slots."
    }
  )
  @opExample(
    #{
      returnType: #{
        eventTypeId: "event-60",
        windowDays: 14,
        date: plainDate.fromISO("2026-04-25"),
        timezone: "Europe/Moscow",
        workdayStart: "09:00",
        workdayEnd: "18:00",
        slotDurationMinutes: 60,
        items: #[
          #{
            startAt: utcDateTime.fromISO("2026-04-25T06:00:00Z"),
            endAt: utcDateTime.fromISO("2026-04-25T07:00:00Z"),
            isAvailable: false,
            busyReason: "BOOKING"
          },
          #{
            startAt: utcDateTime.fromISO("2026-04-25T07:00:00Z"),
            endAt: utcDateTime.fromISO("2026-04-25T08:00:00Z"),
            isAvailable: false,
            busyReason: "OWNER_BLOCK"
          }
        ]
      }
    },
    #{
      title: "slotsNoFreeTime",
      description: "No free slots for the selected date in 09:00-18:00 workday."
    }
  )
  @get
  @route("/event-types/{eventTypeId}/slots")
  listAvailableSlots(
    @path eventTypeId: string,
    @query date: plainDate,
    @query windowDays?: int32
  ): SlotListResponse | ValidationError | NotFoundError;

  @post
  @route("/bookings")
  createBooking(
    @body booking: CreateBookingRequest
  ): Booking | ValidationError | NotFoundError | OutOfWindowError | SlotConflictError;
}
