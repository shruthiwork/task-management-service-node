import { v4 as uuidv4 } from "uuid";
import { TaskStatus, canTransition } from "../value-objects/task-status.js";
import { TaskPriority } from "../value-objects/task-priority.js";
import { ValidationError } from "../errors/index.js";

export interface TaskProps {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Task {
  private constructor(private props: TaskProps) {}

  static create(params: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string;
    dueDate?: Date;
    tags?: string[];
  }): Task {
    const now = new Date();

    if (!params.title || params.title.trim().length === 0) {
      throw new ValidationError("Title is required");
    }

    if (params.title.trim().length > 255) {
      throw new ValidationError("Title must be 255 characters or fewer");
    }

    if (params.dueDate && params.dueDate < now) {
      throw new ValidationError("Due date must be in the future");
    }

    return new Task({
      id: uuidv4(),
      title: params.title.trim(),
      description: params.description?.trim() ?? "",
      status: TaskStatus.PENDING,
      priority: params.priority ?? TaskPriority.MEDIUM,
      assigneeId: params.assigneeId ?? null,
      dueDate: params.dueDate ?? null,
      tags: params.tags ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstitute from persistence — no validation, assumes data integrity.
   */
  static fromPersistence(props: TaskProps): Task {
    return new Task({ ...props });
  }

  // --- Accessors ---

  get id(): string {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get description(): string {
    return this.props.description;
  }
  get status(): TaskStatus {
    return this.props.status;
  }
  get priority(): TaskPriority {
    return this.props.priority;
  }
  get assigneeId(): string | null {
    return this.props.assigneeId;
  }
  get dueDate(): Date | null {
    return this.props.dueDate;
  }
  get tags(): string[] {
    return [...this.props.tags];
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // --- Behavior ---

  transitionTo(newStatus: TaskStatus): void {
    if (!canTransition(this.props.status, newStatus)) {
      throw new ValidationError(
        `Cannot transition from '${this.props.status}' to '${newStatus}'`
      );
    }
    this.props.status = newStatus;
    this.touch();
  }

  updateDetails(params: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string | null;
    dueDate?: Date | null;
    tags?: string[];
  }): void {
    if (params.title !== undefined) {
      if (params.title.trim().length === 0) {
        throw new ValidationError("Title is required");
      }
      if (params.title.trim().length > 255) {
        throw new ValidationError("Title must be 255 characters or fewer");
      }
      this.props.title = params.title.trim();
    }

    if (params.description !== undefined) {
      this.props.description = params.description.trim();
    }

    if (params.priority !== undefined) {
      this.props.priority = params.priority;
    }

    if (params.assigneeId !== undefined) {
      this.props.assigneeId = params.assigneeId;
    }

    if (params.dueDate !== undefined) {
      this.props.dueDate = params.dueDate;
    }

    if (params.tags !== undefined) {
      this.props.tags = params.tags;
    }

    this.touch();
  }

  toJSON(): TaskProps {
    return { ...this.props, tags: [...this.props.tags] };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
