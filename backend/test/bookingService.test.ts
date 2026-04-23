import assert from "node:assert/strict";
import test from "node:test";
import type { AppConfig } from "../src/config.js";
import { BookingService } from "../src/domain/bookingService.js";
import { createMemoryStore } from "../src/store/memoryStore.js";
import { DomainError } from "../src/utils/errors.js";

const baseConfig: AppConfig = {
  port: 3000,
  host: "127.0.0.1",
  timezone: "Europe/Moscow",
  workdayStart: "09:00",
  workdayEnd: "18:00",
  bookingWindowDays: 14,
};

const withMockedNow = async (isoNow: string, run: () => void): Promise<void> => {
  const nowMs = Date.parse(isoNow);
  const originalDateNow = Date.now;
  Date.now = () => nowMs;
  try {
    run();
  } finally {
    Date.now = originalDateNow;
  }
};

test("listAvailableSlots allows querying today after workday start", async () => {
  await withMockedNow("2026-04-23T12:00:00.000Z", () => {
    const service = new BookingService(createMemoryStore(), baseConfig);
    const result = service.listAvailableSlots("event-15", "2026-04-23", 14);
    const nowMs = Date.parse("2026-04-23T12:00:00.000Z");

    assert.equal(result.date, "2026-04-23");
    assert.ok(result.items.length > 0);
    assert.ok(result.items.every((slot) => Date.parse(slot.startAt) >= nowMs));
  });
});

test("listAvailableSlots rejects dates beyond booking window", async () => {
  await withMockedNow("2026-04-23T12:00:00.000Z", () => {
    const service = new BookingService(createMemoryStore(), baseConfig);

    assert.throws(
      () => service.listAvailableSlots("event-15", "2026-05-08", 14),
      (error: unknown): boolean => {
        if (!(error instanceof DomainError)) {
          return false;
        }
        assert.equal(error.payload.code, "BOOKING_WINDOW_EXCEEDED");
        return true;
      },
    );
  });
});

test("listAvailableSlots returns slots for dates inside booking window", async () => {
  await withMockedNow("2026-04-23T12:00:00.000Z", () => {
    const service = new BookingService(createMemoryStore(), baseConfig);
    const result = service.listAvailableSlots("event-15", "2026-05-05", 14);

    assert.equal(result.windowDays, 14);
    assert.ok(result.items.length > 0);
    assert.equal(result.items[0]?.startAt, "2026-05-05T09:00:00.000+03:00");
  });
});

test("listAvailableSlots returns empty list when all today's slots are in the past", async () => {
  await withMockedNow("2026-04-23T20:00:00.000Z", () => {
    const service = new BookingService(createMemoryStore(), baseConfig);
    const result = service.listAvailableSlots("event-15", "2026-04-23", 14);

    assert.equal(result.items.length, 0);
  });
});

test("listAvailableSlots excludes slot that starts exactly at current time", async () => {
  await withMockedNow("2026-04-23T12:00:00.000Z", () => {
    const service = new BookingService(createMemoryStore(), baseConfig);
    const result = service.listAvailableSlots("event-15", "2026-04-23", 14);

    assert.ok(result.items.every((slot) => slot.startAt !== "2026-04-23T15:00:00.000+03:00"));
    assert.equal(result.items[0]?.startAt, "2026-04-23T15:15:00.000+03:00");
  });
});

test("listAvailableSlots keeps moscow day semantics near midnight", async () => {
  await withMockedNow("2026-04-22T21:30:00.000Z", () => {
    const service = new BookingService(createMemoryStore(), baseConfig);
    const result = service.listAvailableSlots("event-15", "2026-04-23", 14);

    assert.equal(result.items[0]?.startAt, "2026-04-23T09:00:00.000+03:00");
  });
});

test("createBooking requires explicit timezone in startAt", async () => {
  await withMockedNow("2026-04-23T06:00:00.000Z", () => {
    const service = new BookingService(createMemoryStore(), baseConfig);

    assert.rejects(
      () =>
        service.createBooking({
          eventTypeId: "event-15",
          startAt: "2026-04-24T10:00:00",
          guest: { name: "Guest", email: "guest@example.com" },
        }),
      (error: unknown): boolean => {
        if (!(error instanceof DomainError)) {
          return false;
        }
        assert.equal(error.payload.code, "VALIDATION_ERROR");
        return true;
      },
    );
  });
});
