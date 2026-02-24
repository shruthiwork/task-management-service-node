import { Router } from "express";
import type { TaskController } from "../controllers/task.controller.js";
import { validate } from "../middleware/validate.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  listTasksQuerySchema,
  idParamSchema,
} from "../validators/index.js";

export function createTaskRouter(controller: TaskController): Router {
  const router = Router();

  router.get(
    "/",
    validate(listTasksQuerySchema, "query"),
    controller.handleList
  );

  router.post(
    "/",
    validate(createTaskSchema, "body"),
    controller.handleCreate
  );

  router.get(
    "/:id",
    validate(idParamSchema, "params"),
    controller.handleGetById
  );

  router.patch(
    "/:id",
    validate(idParamSchema, "params"),
    validate(updateTaskSchema, "body"),
    controller.handleUpdate
  );

  router.patch(
    "/:id/status",
    validate(idParamSchema, "params"),
    validate(updateTaskStatusSchema, "body"),
    controller.handleUpdateStatus
  );

  router.delete(
    "/:id",
    validate(idParamSchema, "params"),
    controller.handleDelete
  );

  return router;
}
