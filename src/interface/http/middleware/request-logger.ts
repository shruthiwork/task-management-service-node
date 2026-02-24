import type { Request, Response, NextFunction } from "express";
import type { Logger } from "../../../application/interfaces/index.js";

export function createRequestLogger(logger: Logger) {
  return function requestLogger(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
      });
    });

    next();
  };
}
