import { ZodSafeParseResult } from 'zod';
import { ZodValidationError } from '../types/error.type';

export const formatZodError = <T>(validatedData: ZodSafeParseResult<T>) => {
  const errors: Record<string, string[]> = {};

  if (!validatedData.success) {
    const fieldErrors = validatedData.error.flatten().fieldErrors;
    Object.assign(errors, fieldErrors);
  }

  if (Object.keys(errors).length > 0) {
    const joinedErrors: Record<string, string> = {};
    for (const [key, messages] of Object.entries(errors)) {
      joinedErrors[key] = messages.join(', ');
    }
    throw new ZodValidationError(joinedErrors);
  }
};
