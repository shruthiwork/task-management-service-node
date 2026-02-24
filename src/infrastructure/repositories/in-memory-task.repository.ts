import { Task } from "../../domain/entities/index.js";
import type {
  TaskRepository,
  TaskFilter,
  PaginationParams,
  PaginatedResult,
} from "../../domain/repositories/index.js";

export class InMemoryTaskRepository implements TaskRepository {
  private readonly store = new Map<string, Task>();

  async findById(id: string): Promise<Task | null> {
    const task = this.store.get(id);
    return task ?? null;
  }

  async findAll(
    filter: TaskFilter,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Task>> {
    let tasks = Array.from(this.store.values());

    if (filter.status) {
      tasks = tasks.filter((t) => t.status === filter.status);
    }
    if (filter.priority) {
      tasks = tasks.filter((t) => t.priority === filter.priority);
    }
    if (filter.assigneeId) {
      tasks = tasks.filter((t) => t.assigneeId === filter.assigneeId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // Sort by createdAt descending
    tasks.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const total = tasks.length;
    const offset = (pagination.page - 1) * pagination.limit;
    const data = tasks.slice(offset, offset + pagination.limit);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async save(task: Task): Promise<void> {
    this.store.set(task.id, task);
  }

  async update(task: Task): Promise<void> {
    this.store.set(task.id, task);
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async existsById(id: string): Promise<boolean> {
    return this.store.has(id);
  }
}
