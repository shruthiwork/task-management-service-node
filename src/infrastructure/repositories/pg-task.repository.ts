import type pg from "pg";
import { Task } from "../../domain/entities/index.js";
import type { TaskStatus } from "../../domain/value-objects/task-status.js";
import type { TaskPriority } from "../../domain/value-objects/task-priority.js";
import type {
  TaskRepository,
  TaskFilter,
  PaginationParams,
  PaginatedResult,
} from "../../domain/repositories/index.js";

interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee_id: string | null;
  due_date: Date | null;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

function rowToEntity(row: TaskRow): Task {
  return Task.fromPersistence({
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    assigneeId: row.assignee_id,
    dueDate: row.due_date,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export class PgTaskRepository implements TaskRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findById(id: string): Promise<Task | null> {
    const { rows } = await this.pool.query<TaskRow>(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );
    return rows.length > 0 ? rowToEntity(rows[0]) : null;
  }

  async findAll(
    filter: TaskFilter,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Task>> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (filter.status) {
      conditions.push(`status = $${paramIdx++}`);
      params.push(filter.status);
    }
    if (filter.priority) {
      conditions.push(`priority = $${paramIdx++}`);
      params.push(filter.priority);
    }
    if (filter.assigneeId) {
      conditions.push(`assignee_id = $${paramIdx++}`);
      params.push(filter.assigneeId);
    }
    if (filter.search) {
      conditions.push(
        `(title ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`
      );
      params.push(`%${filter.search}%`);
      paramIdx++;
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) as total FROM tasks ${where}`;
    const countResult = await this.pool.query<{ total: string }>(
      countQuery,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const offset = (pagination.page - 1) * pagination.limit;
    const dataQuery = `SELECT * FROM tasks ${where} ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx}`;
    const dataResult = await this.pool.query<TaskRow>(dataQuery, [
      ...params,
      pagination.limit,
      offset,
    ]);

    return {
      data: dataResult.rows.map(rowToEntity),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async save(task: Task): Promise<void> {
    const t = task.toJSON();
    await this.pool.query(
      `INSERT INTO tasks (id, title, description, status, priority, assignee_id, due_date, tags, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.assigneeId,
        t.dueDate,
        t.tags,
        t.createdAt,
        t.updatedAt,
      ]
    );
  }

  async update(task: Task): Promise<void> {
    const t = task.toJSON();
    await this.pool.query(
      `UPDATE tasks SET title=$1, description=$2, status=$3, priority=$4,
       assignee_id=$5, due_date=$6, tags=$7, updated_at=$8 WHERE id=$9`,
      [
        t.title,
        t.description,
        t.status,
        t.priority,
        t.assigneeId,
        t.dueDate,
        t.tags,
        t.updatedAt,
        t.id,
      ]
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const { rows } = await this.pool.query<{ exists: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM tasks WHERE id = $1) as exists",
      [id]
    );
    return rows[0].exists;
  }
}
