export class ZodValidationError<T = Record<string, string>> extends Error {
    public errors: T;
    constructor(errors: T) {
        super("Validation error")
        this.name = "ZodValidationError";
        this.errors = errors;
    }
}
