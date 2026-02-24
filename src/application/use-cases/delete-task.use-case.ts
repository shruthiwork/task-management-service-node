import type { TaskRepository } from "../../domain/repositories/index.js";
import { EntityNotFoundError } from "../../domain/errors/index.js";
import type { Logger } from "../interfaces/index.js";

export class DeleteTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly logger: Logger
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.taskRepository.delete(id);
    if (!deleted) {
      throw new EntityNotFoundError("Task", id);
    }
    this.logger.info("Task deleted", { taskId: id });
  }
}
