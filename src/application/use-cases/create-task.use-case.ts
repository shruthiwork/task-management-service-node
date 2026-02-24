import { Task } from "../../domain/entities/index.js";
import type { TaskRepository } from "../../domain/repositories/index.js";
import type { Logger } from "../interfaces/index.js";
import type { CreateTaskDto, TaskResponseDto } from "../dtos/index.js";
import { toTaskResponse } from "./task-mapper.js";

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly logger: Logger
  ) {}

  async execute(dto: CreateTaskDto): Promise<TaskResponseDto> {
    const task = Task.create({
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      assigneeId: dto.assigneeId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      tags: dto.tags,
    });

    await this.taskRepository.save(task);
    this.logger.info("Task created", { taskId: task.id });

    return toTaskResponse(task);
  }
}
