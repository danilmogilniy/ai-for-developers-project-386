import type { FastifyInstance } from "fastify";
import type { BookingService } from "../domain/bookingService.js";
import type { CreateEventTypeRequest, UpdateEventTypeRequest } from "../types/contracts.js";
import { createValidationError } from "../utils/errors.js";

export const registerOwnerRoutes = async (
  app: FastifyInstance,
  bookingService: BookingService,
): Promise<void> => {
  app.get("/api/owner/profile", async () => bookingService.getOwnerProfile());

  app.get("/api/owner/bookings/upcoming", async () => bookingService.listUpcomingBookings());

  app.get("/api/owner/event-types", async () => bookingService.listOwnerEventTypes());

  app.post("/api/owner/event-types", async (request, reply) => {
    const payload = request.body as Partial<CreateEventTypeRequest>;
    if (!payload || typeof payload !== "object") {
      return reply.send(createValidationError("body is required"));
    }

    if (!payload.title || payload.durationMinutes === undefined) {
      return reply.send(createValidationError("title and durationMinutes are required"));
    }

    return bookingService.createEventType(payload as CreateEventTypeRequest);
  });

  app.patch("/api/owner/event-types/:eventTypeId", async (request, reply) => {
    const eventTypeId = (request.params as { eventTypeId?: string }).eventTypeId;
    if (!eventTypeId) {
      return reply.send(createValidationError("eventTypeId path parameter is required"));
    }

    const payload = (request.body ?? {}) as UpdateEventTypeRequest;
    return bookingService.updateEventType(eventTypeId, payload);
  });

  app.delete("/api/owner/event-types/:eventTypeId", async (request, reply) => {
    const eventTypeId = (request.params as { eventTypeId?: string }).eventTypeId;
    if (!eventTypeId) {
      return reply.send(createValidationError("eventTypeId path parameter is required"));
    }

    return bookingService.deleteEventType(eventTypeId);
  });
};
