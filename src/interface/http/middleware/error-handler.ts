import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import {
  DomainError,
  EntityNotFoundError,
  ValidationError,
} from "../../../domain/errors/index.js";
import type { Logger } from "../../../application/interfaces/index.js";

export function createErrorHandler(logger: Logger) {
  return function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    // Zod validation errors
    if (err instanceof ZodError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.flatten().fieldErrors,
      });
      return;
    }

    // Domain validation errors
    if (err instanceof ValidationError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: err.message,
        code: err.code,
        details: err.details,
      });
      return;
    }

    // Not found
    if (err instanceof EntityNotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: err.message,
        code: err.code,
      });
      return;
    }

    // Other domain errors
    if (err instanceof DomainError) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        error: err.message,
        code: err.code,
      });
      return;
    }

    // Unexpected errors — don't leak internals
    logger.error("Unhandled error", {
      error: err.message,
      stack: err.stack,
    });

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  };
}
