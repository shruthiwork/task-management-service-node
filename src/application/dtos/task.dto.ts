import { TaskStatus } from "../../domain/value-objects/task-status.js";
import { TaskPriority } from "../../domain/value-objects/task-priority.js";

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string; // ISO 8601
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null; // ISO 8601
  tags?: string[];
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
}

export interface ListTasksDto {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaskResponseDto {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
