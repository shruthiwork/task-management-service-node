import type { TaskRepository } from "../../domain/repositories/index.js";
import { EntityNotFoundError } from "../../domain/errors/index.js";
import type { Logger } from "../interfaces/index.js";
import type { UpdateTaskStatusDto, TaskResponseDto } from "../dtos/index.js";
import { toTaskResponse } from "./task-mapper.js";

export class UpdateTaskStatusUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly logger: Logger
  ) {}

  async execute(
    id: string,
    dto: UpdateTaskStatusDto
  ): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new EntityNotFoundError("Task", id);
    }

    task.transitionTo(dto.status);
    await this.taskRepository.update(task);
    this.logger.info("Task status updated", {
      taskId: id,
      status: dto.status,
    });

    return toTaskResponse(task);
  }
}
