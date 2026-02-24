import type { TaskRepository } from "../../domain/repositories/index.js";
import { EntityNotFoundError } from "../../domain/errors/index.js";
import type { TaskResponseDto } from "../dtos/index.js";
import { toTaskResponse } from "./task-mapper.js";

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new EntityNotFoundError("Task", id);
    }
    return toTaskResponse(task);
  }
}
