import { z } from "zod";
import { TaskStatus } from "../../../domain/value-objects/task-status.js";
import { TaskPriority } from "../../../domain/value-objects/task-priority.js";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const listTasksQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  page: z.preprocess(
    (v) => (v === undefined || v === "" ? undefined : Number(v)),
    z.number().int().positive().default(1)
  ),
  limit: z.preprocess(
    (v) => (v === undefined || v === "" ? undefined : Number(v)),
    z.number().int().positive().max(100).default(20)
  ),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
