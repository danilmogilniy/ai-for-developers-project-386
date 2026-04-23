import cors from "@fastify/cors";
import Fastify from "fastify";
import { config } from "./config.js";
import { BookingService } from "./domain/bookingService.js";
import { registerGuestRoutes } from "./routes/guestRoutes.js";
import { registerOwnerRoutes } from "./routes/ownerRoutes.js";
import { createMemoryStore } from "./store/memoryStore.js";
import { DomainError } from "./utils/errors.js";
export const buildServer = () => {
    const app = Fastify({ logger: true });
    const store = createMemoryStore();
    const bookingService = new BookingService(store, config);
    app.register(cors, {
        origin: true,
        methods: ["GET", "HEAD", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
    app.get("/", async () => ({
        service: "booking-api",
        health: "/health",
    }));
    app.get("/health", async () => ({ ok: true }));
    app.register(async (instance) => {
        await registerGuestRoutes(instance, bookingService);
        await registerOwnerRoutes(instance, bookingService);
    });
    app.setErrorHandler((error, _request, reply) => {
        if (error instanceof DomainError) {
            return reply.status(200).send(error.payload);
        }
        if (typeof error === "object" &&
            error !== null &&
            "validation" in error &&
            error.validation) {
            const message = "message" in error && typeof error.message === "string"
                ? error.message
                : "Validation failed";
            const payload = {
                code: "VALIDATION_ERROR",
                message: "Validation failed",
                details: message,
            };
            return reply.status(200).send(payload);
        }
        app.log.error(error);
        const payload = {
            code: "VALIDATION_ERROR",
            message: "Unexpected server error",
        };
        return reply.status(200).send(payload);
    });
    return app;
};
const bootstrap = async () => {
    const app = buildServer();
    await app.listen({ port: config.port, host: config.host });
};
bootstrap().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
});
