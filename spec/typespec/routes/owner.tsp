import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace CallCalendar;

@tag("Owner")
@route("/api/owner")
interface OwnerApi {
  @get
  @route("/profile")
  getProfile(): OwnerProfile;

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
    #{ title: "ownerEventTypes", description: "All owner-managed event types." }
  )
  @get
  @route("/event-types")
  listEventTypes(): EventTypeListResponse;

  @post
  @route("/event-types")
  createEventType(@body input: CreateEventTypeRequest): EventType | ValidationError;

  @patch
  @route("/event-types/{eventTypeId}")
  updateEventType(
    @path eventTypeId: string,
    @body input: UpdateEventTypeRequest
  ): EventType | ValidationError | NotFoundError;

  @delete
  @route("/event-types/{eventTypeId}")
  deleteEventType(@path eventTypeId: string): DeleteEventTypeResponse | NotFoundError;

  @opExample(
    #{
      returnType: #{
        items: #[
          #{
            id: "booking-2026-04-22-1",
            eventTypeId: "event-30",
            eventTypeTitle: "Discovery Call",
            startAt: utcDateTime.fromISO("2026-04-22T09:00:00.000Z"),
            endAt: utcDateTime.fromISO("2026-04-22T09:30:00.000Z"),
            guest: #{
              name: "Alice Johnson",
              email: "alice@example.com",
              note: "Wants to discuss onboarding."
            },
            createdAt: utcDateTime.fromISO("2026-04-20T12:00:00.000Z")
          },
          #{
            id: "booking-2026-04-22-2",
            eventTypeId: "event-60",
            eventTypeTitle: "Deep Dive",
            startAt: utcDateTime.fromISO("2026-04-22T14:00:00.000Z"),
            endAt: utcDateTime.fromISO("2026-04-22T15:00:00.000Z"),
            guest: #{
              name: "Bob Smith",
              email: "bob@example.com",
              note: "Product architecture review."
            },
            createdAt: utcDateTime.fromISO("2026-04-20T12:30:00.000Z")
          },
          #{
            id: "booking-2026-04-23-1",
            eventTypeId: "event-15",
            eventTypeTitle: "Quick Sync",
            startAt: utcDateTime.fromISO("2026-04-23T08:30:00.000Z"),
            endAt: utcDateTime.fromISO("2026-04-23T08:45:00.000Z"),
            guest: #{
              name: "Carol Lee",
              email: "carol@example.com",
              note: "Follow-up on previous call."
            },
            createdAt: utcDateTime.fromISO("2026-04-21T10:00:00.000Z")
          },
          #{
            id: "booking-2026-04-23-2",
            eventTypeId: "event-30",
            eventTypeTitle: "Discovery Call",
            startAt: utcDateTime.fromISO("2026-04-23T10:00:00.000Z"),
            endAt: utcDateTime.fromISO("2026-04-23T10:30:00.000Z"),
            guest: #{
              name: "David Green",
              email: "david@example.com",
              note: "Initial requirements discussion."
            },
            createdAt: utcDateTime.fromISO("2026-04-21T10:15:00.000Z")
          },
          #{
            id: "booking-2026-04-23-3",
            eventTypeId: "event-30",
            eventTypeTitle: "Discovery Call",
            startAt: utcDateTime.fromISO("2026-04-23T13:00:00.000Z"),
            endAt: utcDateTime.fromISO("2026-04-23T13:30:00.000Z"),
            guest: #{
              name: "Emma Wilson",
              email: "emma@example.com",
              note: "Review integration details."
            },
            createdAt: utcDateTime.fromISO("2026-04-21T11:00:00.000Z")
          },
          #{
            id: "booking-2026-04-23-4",
            eventTypeId: "event-60",
            eventTypeTitle: "Deep Dive",
            startAt: utcDateTime.fromISO("2026-04-23T16:00:00.000Z"),
            endAt: utcDateTime.fromISO("2026-04-23T17:00:00.000Z"),
            guest: #{
              name: "Frank Brown",
              email: "frank@example.com",
              note: "Technical roadmap planning."
            },
            createdAt: utcDateTime.fromISO("2026-04-21T11:30:00.000Z")
          }
        ],
        total: 6
      }
    },
    #{ title: "ownerUpcoming_2026_04_22_23", description: "Upcoming bookings for Apr 22 and Apr 23." }
  )
  @get
  @route("/bookings/upcoming")
  listUpcomingBookings(): BookingListResponse;
}
