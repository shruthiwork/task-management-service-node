import type { TaskRepository } from "../../domain/repositories/index.js";
import { EntityNotFoundError } from "../../domain/errors/index.js";
import type { Logger } from "../interfaces/index.js";
import type { UpdateTaskDto, TaskResponseDto } from "../dtos/index.js";
import { toTaskResponse } from "./task-mapper.js";

export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly logger: Logger
  ) {}

  async execute(id: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new EntityNotFoundError("Task", id);
    }

    task.updateDetails({
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      assigneeId: dto.assigneeId,
      dueDate: dto.dueDate === null ? null : dto.dueDate ? new Date(dto.dueDate) : undefined,
      tags: dto.tags,
    });

    await this.taskRepository.update(task);
    this.logger.info("Task updated", { taskId: id });

    return toTaskResponse(task);
  }
}
