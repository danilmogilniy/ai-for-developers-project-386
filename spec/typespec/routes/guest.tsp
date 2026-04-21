import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace CallCalendar;

@tag("Guest")
@route("/api/guest")
interface GuestApi {
  @get
  @route("/event-types")
  listEventTypes(): EventTypeListResponse;

  @get
  @route("/event-types/{eventTypeId}/slots")
  listAvailableSlots(
    @path eventTypeId: string,
    @query windowDays?: int32
  ): SlotListResponse | ValidationError | NotFoundError;

  @post
  @route("/bookings")
  createBooking(
    @body booking: CreateBookingRequest
  ): Booking | ValidationError | NotFoundError | OutOfWindowError | SlotConflictError;
}
