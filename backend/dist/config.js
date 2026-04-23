const parseInteger = (raw, fallback) => {
    if (!raw) {
        return fallback;
    }
    const parsed = Number(raw);
    return Number.isInteger(parsed) ? parsed : fallback;
};
export const config = {
    port: parseInteger(process.env.PORT, 3000),
    host: process.env.HOST ?? "0.0.0.0",
    timezone: process.env.TIMEZONE ?? "Europe/Moscow",
    workdayStart: process.env.WORKDAY_START ?? "09:00",
    workdayEnd: process.env.WORKDAY_END ?? "18:00",
    bookingWindowDays: parseInteger(process.env.BOOKING_WINDOW_DAYS, 14),
};
