import { config } from "./infrastructure/config/index.js";
import { PinoLogger } from "./infrastructure/logger/index.js";
import { InMemoryTaskRepository } from "./infrastructure/repositories/index.js";
import { PgTaskRepository } from "./infrastructure/repositories/index.js";
import { createPool, INIT_SQL } from "./infrastructure/database/index.js";
import { createApp } from "./app.js";
import type { TaskRepository } from "./domain/repositories/index.js";
import type pg from "pg";

const logger = new PinoLogger("main");

async function bootstrap(): Promise<void> {
  let taskRepository: TaskRepository;
  let pool: pg.Pool | null = null;

  if (config.USE_IN_MEMORY) {
    logger.info("Using in-memory task repository");
    taskRepository = new InMemoryTaskRepository();
  } else {
    logger.info("Connecting to PostgreSQL");
    pool = createPool();
    await pool.query(INIT_SQL);
    logger.info("Database initialized");
    taskRepository = new PgTaskRepository(pool);
  }

  const app = createApp({ taskRepository, logger });

  const server = app.listen(config.PORT, () => {
    logger.info(`Server listening on port ${config.PORT}`, {
      env: config.NODE_ENV,
      port: config.PORT,
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`);

    server.close(async () => {
      if (pool) {
        await pool.end();
        logger.info("Database pool closed");
      }
      logger.info("Server closed");
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Catch unhandled rejections
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", {
      reason: reason instanceof Error ? reason.message : String(reason),
    });
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
