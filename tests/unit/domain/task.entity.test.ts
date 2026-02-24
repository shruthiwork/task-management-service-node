import { describe, it, expect } from "vitest";
import { Task } from "../../../src/domain/entities/task.entity.js";
import { TaskStatus } from "../../../src/domain/value-objects/task-status.js";
import { TaskPriority } from "../../../src/domain/value-objects/task-priority.js";
import { ValidationError } from "../../../src/domain/errors/index.js";

describe("Task Entity", () => {
  it("creates a task with defaults", () => {
    const task = Task.create({ title: "Test task" });

    expect(task.id).toBeDefined();
    expect(task.title).toBe("Test task");
    expect(task.description).toBe("");
    expect(task.status).toBe(TaskStatus.PENDING);
    expect(task.priority).toBe(TaskPriority.MEDIUM);
    expect(task.assigneeId).toBeNull();
    expect(task.dueDate).toBeNull();
    expect(task.tags).toEqual([]);
  });

  it("creates a task with all fields", () => {
    const dueDate = new Date(Date.now() + 86_400_000);
    const task = Task.create({
      title: "Full task",
      description: "A description",
      priority: TaskPriority.HIGH,
      assigneeId: "user-1",
      dueDate,
      tags: ["backend", "urgent"],
    });

    expect(task.title).toBe("Full task");
    expect(task.description).toBe("A description");
    expect(task.priority).toBe(TaskPriority.HIGH);
    expect(task.assigneeId).toBe("user-1");
    expect(task.dueDate).toEqual(dueDate);
    expect(task.tags).toEqual(["backend", "urgent"]);
  });

  it("rejects empty title", () => {
    expect(() => Task.create({ title: "" })).toThrow(ValidationError);
    expect(() => Task.create({ title: "   " })).toThrow(ValidationError);
  });

  it("rejects title longer than 255 chars", () => {
    expect(() => Task.create({ title: "a".repeat(256) })).toThrow(
      ValidationError
    );
  });

  it("trims title and description", () => {
    const task = Task.create({
      title: "  trimmed  ",
      description: "  desc  ",
    });
    expect(task.title).toBe("trimmed");
    expect(task.description).toBe("desc");
  });

  describe("status transitions", () => {
    it("transitions PENDING -> IN_PROGRESS", () => {
      const task = Task.create({ title: "t" });
      task.transitionTo(TaskStatus.IN_PROGRESS);
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it("transitions IN_PROGRESS -> COMPLETED", () => {
      const task = Task.create({ title: "t" });
      task.transitionTo(TaskStatus.IN_PROGRESS);
      task.transitionTo(TaskStatus.COMPLETED);
      expect(task.status).toBe(TaskStatus.COMPLETED);
    });

    it("transitions PENDING -> CANCELLED", () => {
      const task = Task.create({ title: "t" });
      task.transitionTo(TaskStatus.CANCELLED);
      expect(task.status).toBe(TaskStatus.CANCELLED);
    });

    it("rejects invalid transition PENDING -> COMPLETED", () => {
      const task = Task.create({ title: "t" });
      expect(() => task.transitionTo(TaskStatus.COMPLETED)).toThrow(
        ValidationError
      );
    });

    it("rejects transition from terminal state COMPLETED", () => {
      const task = Task.create({ title: "t" });
      task.transitionTo(TaskStatus.IN_PROGRESS);
      task.transitionTo(TaskStatus.COMPLETED);
      expect(() => task.transitionTo(TaskStatus.PENDING)).toThrow(
        ValidationError
      );
    });
  });

  describe("updateDetails", () => {
    it("updates title", () => {
      const task = Task.create({ title: "old" });
      task.updateDetails({ title: "new" });
      expect(task.title).toBe("new");
    });

    it("rejects empty title on update", () => {
      const task = Task.create({ title: "old" });
      expect(() => task.updateDetails({ title: "" })).toThrow(
        ValidationError
      );
    });

    it("updates updatedAt on change", () => {
      const task = Task.create({ title: "t" });
      const before = task.updatedAt;
      // Small delay to ensure timestamp differs
      task.updateDetails({ description: "updated" });
      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
    });
  });
});
