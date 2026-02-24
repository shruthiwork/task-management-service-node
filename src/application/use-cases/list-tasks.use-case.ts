import type { TaskRepository, PaginatedResult } from "../../domain/repositories/index.js";
import type { ListTasksDto, TaskResponseDto } from "../dtos/index.js";
import { toTaskResponse } from "./task-mapper.js";

export class ListTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(
    dto: ListTasksDto
  ): Promise<PaginatedResult<TaskResponseDto>> {
    const result = await this.taskRepository.findAll(
      {
        status: dto.status,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        search: dto.search,
      },
      {
        page: dto.page ?? 1,
        limit: Math.min(dto.limit ?? 20, 100),
      }
    );

    return {
      ...result,
      data: result.data.map(toTaskResponse),
    };
  }
}
