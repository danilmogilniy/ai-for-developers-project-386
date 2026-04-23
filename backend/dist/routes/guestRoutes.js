import { DomainError, createValidationError } from "../utils/errors.js";
export const registerGuestRoutes = async (app, bookingService) => {
    app.get("/api/guest/event-types", async () => bookingService.listGuestEventTypes());
    app.get("/api/guest/event-types/:eventTypeId/slots", async (request) => {
        const eventTypeId = request.params.eventTypeId;
        if (!eventTypeId) {
            throw new DomainError("VALIDATION_ERROR", "eventTypeId path parameter is required");
        }
        const date = request.query.date;
        if (!date) {
            throw new DomainError("VALIDATION_ERROR", "date query parameter is required");
        }
        const windowDaysRaw = request.query.windowDays;
        const windowDays = typeof windowDaysRaw === "string" ? Number(windowDaysRaw) : typeof windowDaysRaw === "number" ? windowDaysRaw : undefined;
        if (windowDaysRaw !== undefined && !Number.isInteger(windowDays)) {
            throw new DomainError("VALIDATION_ERROR", "windowDays must be an integer");
        }
        return bookingService.listAvailableSlots(eventTypeId, date, windowDays);
    });
    app.post("/api/guest/bookings", async (request, reply) => {
        const payload = request.body;
        if (!payload || typeof payload !== "object") {
            return reply.send(createValidationError("body is required"));
        }
        if (!payload.eventTypeId || !payload.startAt || !payload.guest) {
            return reply.send(createValidationError("eventTypeId, startAt and guest are required"));
        }
        return bookingService.createBooking(payload);
    });
};
