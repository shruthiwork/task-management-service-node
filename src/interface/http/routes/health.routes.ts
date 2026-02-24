import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export function createHealthRouter(): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.status(StatusCodes.OK).json({
      name: "Task Management Service",
      version: "1.0.0",
      endpoints: {
        docs: "/docs",
        health: "/health",
        ready: "/ready",
        tasks: "/api/v1/tasks",
      },
    });
  });

  router.get("/health", (_req, res) => {
    res.status(StatusCodes.OK).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  router.get("/ready", (_req, res) => {
    res.status(StatusCodes.OK).json({ status: "ready" });
  });

  return router;
}
