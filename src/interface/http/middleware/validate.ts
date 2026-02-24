import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

type RequestField = "body" | "query" | "params";

/**
 * Express middleware that validates a request field against a Zod schema.
 * Stores parsed result back on the request. For read-only properties like
 * `query`, uses Object.defineProperty to override the getter.
 */
export function validate(schema: ZodSchema, field: RequestField = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[field]);
    if (!result.success) {
      next(result.error);
      return;
    }
    // req.query is a getter in Express 5+; use defineProperty to override
    Object.defineProperty(req, field, {
      value: result.data,
      writable: true,
      configurable: true,
    });
    next();
  };
}
