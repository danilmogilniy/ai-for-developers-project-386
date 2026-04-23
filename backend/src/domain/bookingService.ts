import type { AppConfig } from "../config.js";
import type { MemoryStore } from "../store/memoryStore.js";
import type {
  Booking,
  BookingListResponse,
  CreateBookingRequest,
  CreateEventTypeRequest,
  DeleteEventTypeResponse,
  EventType,
  EventTypeListResponse,
  OwnerBusyInterval,
  Slot,
  SlotListResponse,
  UpdateEventTypeRequest,
} from "../types/contracts.js";
import { DomainError } from "../utils/errors.js";
import { Mutex } from "../utils/mutex.js";
import {
  addMinutes,
  overlaps,
  parseDateOnly,
  parseIsoDateTimeToMs,
  parseTimeToMinutes,
  toIsoString,
} from "../utils/time.js";

const createId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const ensureNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return normalized;
};

export class BookingService {
  private readonly bookingMutex = new Mutex();

  public constructor(
    private readonly store: MemoryStore,
    private readonly config: AppConfig,
  ) {}

  public listGuestEventTypes(): EventTypeListResponse {
    return this.listEventTypes();
  }

  public listOwnerEventTypes(): EventTypeListResponse {
    return this.listEventTypes();
  }

  public listEventTypes(): EventTypeListResponse {
    const items = [...this.store.eventTypes.values()].map((item) => ({ ...item }));
    return { items, total: items.length };
  }

  public listUpcomingBookings(nowMs: number = Date.now()): BookingListResponse {
    const items = this.store.bookings
      .filter((booking) => this.parseStoredDateTimeToMs(booking.endAt) >= nowMs)
      .sort((a, b) => this.parseStoredDateTimeToMs(a.startAt) - this.parseStoredDateTimeToMs(b.startAt))
      .map((item) => ({ ...item, guest: { ...item.guest } }));

    return { items, total: items.length };
  }

  public createEventType(payload: CreateEventTypeRequest): EventType {
    const title = ensureNonEmptyString(payload.title);
    if (!title) {
      throw new DomainError("VALIDATION_ERROR", "title is required");
    }

    if (!Number.isInteger(payload.durationMinutes) || payload.durationMinutes <= 0) {
      throw new DomainError("VALIDATION_ERROR", "durationMinutes must be a positive integer");
    }

    const description =
      payload.description === undefined ? undefined : ensureNonEmptyString(payload.description);
    if (payload.description !== undefined && description === null) {
      throw new DomainError("VALIDATION_ERROR", "description must be a non-empty string");
    }

    const created: EventType = {
      id: createId("event"),
      title,
      durationMinutes: payload.durationMinutes,
      ...(description ? { description } : {}),
    };

    this.store.eventTypes.set(created.id, created);
    return { ...created };
  }

  public updateEventType(eventTypeId: string, payload: UpdateEventTypeRequest): EventType {
    const existing = this.store.eventTypes.get(eventTypeId);
    if (!existing) {
      throw new DomainError("NOT_FOUND", "Event type not found");
    }

    const next: EventType = { ...existing };

    if (payload.title !== undefined) {
      const title = ensureNonEmptyString(payload.title);
      if (!title) {
        throw new DomainError("VALIDATION_ERROR", "title must be a non-empty string");
      }
      next.title = title;
    }

    if (payload.description !== undefined) {
      const description = ensureNonEmptyString(payload.description);
      if (!description) {
        throw new DomainError("VALIDATION_ERROR", "description must be a non-empty string");
      }
      next.description = description;
    }

    if (payload.durationMinutes !== undefined) {
      if (!Number.isInteger(payload.durationMinutes) || payload.durationMinutes <= 0) {
        throw new DomainError("VALIDATION_ERROR", "durationMinutes must be a positive integer");
      }
      next.durationMinutes = payload.durationMinutes;
    }

    this.store.eventTypes.set(eventTypeId, next);
    return { ...next };
  }

  public deleteEventType(eventTypeId: string): DeleteEventTypeResponse {
    const existed = this.store.eventTypes.delete(eventTypeId);
    if (!existed) {
      throw new DomainError("NOT_FOUND", "Event type not found");
    }

    return { id: eventTypeId };
  }

  public async createBooking(payload: CreateBookingRequest): Promise<Booking> {
    return this.bookingMutex.withLock(async () => {
      const eventType = this.store.eventTypes.get(payload.eventTypeId);
      if (!eventType) {
        throw new DomainError("NOT_FOUND", "Event type not found");
      }

      const startMs = parseIsoDateTimeToMs(payload.startAt);
      if (startMs === null) {
        throw new DomainError("VALIDATION_ERROR", "startAt must be a valid ISO date-time");
      }

      const guestName = ensureNonEmptyString(payload.guest?.name);
      const guestEmail = ensureNonEmptyString(payload.guest?.email);
      if (!guestName || !guestEmail) {
        throw new DomainError("VALIDATION_ERROR", "guest.name and guest.email are required");
      }

      const endMs = addMinutes(startMs, eventType.durationMinutes);
      this.ensureBookingWindow(startMs);

      const conflict = overlaps(startMs, endMs, this.getBusyIntervals());
      if (conflict) {
        throw new DomainError("SLOT_ALREADY_BOOKED", "Requested slot overlaps with a busy interval");
      }

      const note = payload.guest.note?.trim();
      const booking: Booking = {
        id: createId("booking"),
        eventTypeId: eventType.id,
        eventTypeTitle: eventType.title,
        startAt: toIsoString(startMs),
        endAt: toIsoString(endMs),
        guest: {
          name: guestName,
          email: guestEmail,
          ...(note ? { note } : {}),
        },
        createdAt: toIsoString(Date.now()),
      };

      this.store.bookings.push(booking);
      return { ...booking, guest: { ...booking.guest } };
    });
  }

  public listAvailableSlots(eventTypeId: string, date: string, windowDays?: number): SlotListResponse {
    const eventType = this.store.eventTypes.get(eventTypeId);
    if (!eventType) {
      throw new DomainError("NOT_FOUND", "Event type not found");
    }

    const dateObj = parseDateOnly(date);
    if (!dateObj) {
      throw new DomainError("VALIDATION_ERROR", "date query must match YYYY-MM-DD format");
    }

    const requestedWindowDays = windowDays ?? this.config.bookingWindowDays;
    if (!Number.isInteger(requestedWindowDays) || requestedWindowDays <= 0) {
      throw new DomainError("VALIDATION_ERROR", "windowDays must be a positive integer");
    }

    const workdayStartMinutes = parseTimeToMinutes(this.config.workdayStart);
    const workdayEndMinutes = parseTimeToMinutes(this.config.workdayEnd);
    if (workdayStartMinutes === null || workdayEndMinutes === null || workdayEndMinutes <= workdayStartMinutes) {
      throw new DomainError("VALIDATION_ERROR", "Invalid workday start/end configuration");
    }

    const dayStartMs = dateObj.getTime() + workdayStartMinutes * 60_000;
    const dayEndMs = dateObj.getTime() + workdayEndMinutes * 60_000;
    const nowMs = Date.now();
    this.ensureBookingWindow(Math.max(dayStartMs, nowMs), requestedWindowDays);

    const busyIntervals = this.getBusyIntervals();
    const items: Slot[] = [];

    for (
      let slotStartMs = dayStartMs;
      slotStartMs + eventType.durationMinutes * 60_000 <= dayEndMs;
      slotStartMs = addMinutes(slotStartMs, eventType.durationMinutes)
    ) {
      if (slotStartMs <= nowMs) {
        continue;
      }

      const slotEndMs = addMinutes(slotStartMs, eventType.durationMinutes);
      const conflict = overlaps(slotStartMs, slotEndMs, busyIntervals);
      const slot: Slot = {
        startAt: toIsoString(slotStartMs),
        endAt: toIsoString(slotEndMs),
        isAvailable: !conflict,
        ...(conflict ? { busyReason: conflict.busyReason } : {}),
      };

      items.push(slot);
    }

    return {
      eventTypeId,
      windowDays: requestedWindowDays,
      date,
      timezone: this.config.timezone,
      workdayStart: this.config.workdayStart,
      workdayEnd: this.config.workdayEnd,
      slotDurationMinutes: eventType.durationMinutes,
      items,
    };
  }

  public getOwnerProfile() {
    return { ...this.store.ownerProfile };
  }

  private ensureBookingWindow(startMs: number, windowDays: number = this.config.bookingWindowDays): void {
    const now = Date.now();
    const max = now + windowDays * 24 * 60 * 60_000;
    if (startMs < now || startMs > max) {
      throw new DomainError(
        "BOOKING_WINDOW_EXCEEDED",
        `Booking time must be inside ${windowDays}-day window from now`,
      );
    }
  }

  private getBusyIntervals(): OwnerBusyInterval[] {
    const bookings = this.store.bookings.map((booking) => ({
      startMs: this.parseStoredDateTimeToMs(booking.startAt),
      endMs: this.parseStoredDateTimeToMs(booking.endAt),
      busyReason: "BOOKING" as const,
    }));

    const ownerBlocks = this.store.ownerBlocks.map((block) => ({
      startMs: this.parseStoredDateTimeToMs(block.startAt),
      endMs: this.parseStoredDateTimeToMs(block.endAt),
      busyReason: "OWNER_BLOCK" as const,
    }));

    return [...bookings, ...ownerBlocks];
  }

  private parseStoredDateTimeToMs(value: string): number {
    const parsed = parseIsoDateTimeToMs(value);
    if (parsed === null) {
      throw new DomainError("VALIDATION_ERROR", `Stored date-time is invalid: ${value}`);
    }

    return parsed;
  }
}
