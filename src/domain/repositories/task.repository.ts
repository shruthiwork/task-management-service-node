import { Task } from "../entities/task.entity.js";
import { TaskStatus } from "../value-objects/task-status.js";
import { TaskPriority } from "../value-objects/task-priority.js";

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(
    filter: TaskFilter,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Task>>;
  save(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}
