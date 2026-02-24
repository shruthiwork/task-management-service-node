import pino from "pino";
import type { Logger } from "../../application/interfaces/index.js";
import { config } from "../config/index.js";

const pinoInstance = pino({
  level: config.LOG_LEVEL,
  transport:
    config.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export class PinoLogger implements Logger {
  private readonly instance: pino.Logger;

  constructor(context?: string) {
    this.instance = context
      ? pinoInstance.child({ context })
      : pinoInstance;
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.instance.info(meta, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.instance.warn(meta, message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.instance.error(meta, message);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.instance.debug(meta, message);
  }
}
