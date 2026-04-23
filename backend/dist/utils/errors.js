export class DomainError extends Error {
    payload;
    constructor(code, message, details) {
        super(message);
        this.payload = details ? { code, message, details } : { code, message };
    }
}
export const createValidationError = (message, details) => details
    ? {
        code: "VALIDATION_ERROR",
        message,
        details,
    }
    : {
        code: "VALIDATION_ERROR",
        message,
    };
