import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Zod validation middleware factory.
 * Validates req.body against the provided schema.
 * On failure, returns 400 with a structured list of validation errors.
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = formatZodErrors(result.error);

        res.status(400).json({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          errors,
        });
        return;
      }

      // Replace body with the parsed (and potentially transformed/defaulted) data
      req.body = result.data;
      next();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown validation error';
      res.status(500).json({
        message: `Internal validation error: ${message}`,
        code: 'VALIDATION_INTERNAL_ERROR',
        statusCode: 500,
      });
    }
  };
}

/**
 * Format Zod errors into a user-friendly array of field-level messages.
 */
function formatZodErrors(error: ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}
