import { describe, it, expect, beforeEach } from "vitest";
import { CreateTaskUseCase } from "../../../src/application/use-cases/create-task.use-case.js";
import { InMemoryTaskRepository } from "../../../src/infrastructure/repositories/in-memory-task.repository.js";
import type { Logger } from "../../../src/application/interfaces/index.js";
import { TaskPriority } from "../../../src/domain/value-objects/task-priority.js";
import { TaskStatus } from "../../../src/domain/value-objects/task-status.js";

const noopLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

describe("CreateTaskUseCase", () => {
  let repo: InMemoryTaskRepository;
  let useCase: CreateTaskUseCase;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
    useCase = new CreateTaskUseCase(repo, noopLogger);
  });

  it("creates a task and returns response DTO", async () => {
    const result = await useCase.execute({
      title: "My task",
      description: "Do something",
      priority: TaskPriority.HIGH,
      tags: ["test"],
    });

    expect(result.id).toBeDefined();
    expect(result.title).toBe("My task");
    expect(result.description).toBe("Do something");
    expect(result.status).toBe(TaskStatus.PENDING);
    expect(result.priority).toBe(TaskPriority.HIGH);
    expect(result.tags).toEqual(["test"]);
  });

  it("persists the task in the repository", async () => {
    const result = await useCase.execute({ title: "Persisted" });
    const found = await repo.findById(result.id);
    expect(found).not.toBeNull();
    expect(found!.title).toBe("Persisted");
  });
});
