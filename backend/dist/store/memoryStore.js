const baseEventTypes = [
    { id: "event-15", title: "Quick Sync", description: "Short 15-minute check-in.", durationMinutes: 15 },
    {
        id: "event-30",
        title: "Discovery Call",
        description: "Standard 30-minute conversation.",
        durationMinutes: 30,
    },
    { id: "event-60", title: "Deep Dive", description: "Extended 60-minute session.", durationMinutes: 60 },
];
const baseBookings = [
    {
        id: "booking-2026-04-22-1",
        eventTypeId: "event-30",
        eventTypeTitle: "Discovery Call",
        startAt: "2026-04-22T12:00:00.000+03:00",
        endAt: "2026-04-22T12:30:00.000+03:00",
        guest: { name: "Alice Johnson", email: "alice@example.com", note: "Wants to discuss onboarding." },
        createdAt: "2026-04-20T15:00:00.000+03:00",
    },
];
const baseOwnerBlocks = [
    {
        id: "owner-block-2026-04-22-1",
        startAt: "2026-04-22T14:00:00.000+03:00",
        endAt: "2026-04-22T14:30:00.000+03:00",
    },
];
const ownerProfile = {
    id: "owner-1",
    displayName: "Demo Owner",
    email: "owner@example.com",
};
export const createMemoryStore = () => ({
    eventTypes: new Map(baseEventTypes.map((item) => [item.id, { ...item }])),
    bookings: baseBookings.map((item) => ({ ...item, guest: { ...item.guest } })),
    ownerBlocks: baseOwnerBlocks.map((item) => ({ ...item })),
    ownerProfile,
});
