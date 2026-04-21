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

  @post
  @route("/event-types")
  createEventType(@body input: CreateEventTypeRequest): EventType | ValidationError;

  @get
  @route("/bookings/upcoming")
  listUpcomingBookings(): BookingListResponse;
}
