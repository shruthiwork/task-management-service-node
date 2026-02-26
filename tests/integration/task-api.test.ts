import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { InMemoryTaskRepository } from "../../src/infrastructure/repositories/in-memory-task.repository.js";
import { InMemoryUserRepository } from "../../src/infrastructure/repositories/in-memory-user.repository.js";
import type { Logger } from "../../src/application/interfaces/index.js";

const noopLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

describe("Task API", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    const taskRepository = new InMemoryTaskRepository();
    const userRepository = new InMemoryUserRepository();
    app = createApp({ taskRepository, userRepository, logger: noopLogger });
  });

  describe("GET /health", () => {
    it("returns 200 with status ok", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });

  describe("POST /api/v1/tasks", () => {
    it("creates a task", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .send({ title: "New task" });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("New task");
      expect(res.body.data.status).toBe("PENDING");
      expect(res.body.data.id).toBeDefined();
    });

    it("rejects empty title", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .send({ title: "" });

      expect(res.status).toBe(400);
    });

    it("rejects missing title", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/tasks/:id", () => {
    it("returns a task by id", async () => {
      const created = await request(app)
        .post("/api/v1/tasks")
        .send({ title: "Find me" });

      const res = await request(app).get(
        `/api/v1/tasks/${created.body.data.id}`
      );

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Find me");
    });

    it("returns 404 for non-existent task", async () => {
      const res = await request(app).get(
        "/api/v1/tasks/00000000-0000-0000-0000-000000000000"
      );
      expect(res.status).toBe(404);
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).get("/api/v1/tasks/not-a-uuid");
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/tasks", () => {
    it("returns paginated list", async () => {
      await request(app).post("/api/v1/tasks").send({ title: "Task 1" });
      await request(app).post("/api/v1/tasks").send({ title: "Task 2" });

      const res = await request(app).get("/api/v1/tasks");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(res.body.page).toBe(1);
    });

    it("filters by status", async () => {
      await request(app).post("/api/v1/tasks").send({ title: "Task 1" });

      const res = await request(app).get(
        "/api/v1/tasks?status=COMPLETED"
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe("PATCH /api/v1/tasks/:id", () => {
    it("updates task details", async () => {
      const created = await request(app)
        .post("/api/v1/tasks")
        .send({ title: "Original" });

      const res = await request(app)
        .patch(`/api/v1/tasks/${created.body.data.id}`)
        .send({ title: "Updated", description: "New desc" });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated");
      expect(res.body.data.description).toBe("New desc");
    });
  });

  describe("PATCH /api/v1/tasks/:id/status", () => {
    it("transitions task status", async () => {
      const created = await request(app)
        .post("/api/v1/tasks")
        .send({ title: "Status test" });

      const res = await request(app)
        .patch(`/api/v1/tasks/${created.body.data.id}/status`)
        .send({ status: "IN_PROGRESS" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("IN_PROGRESS");
    });

    it("rejects invalid transition", async () => {
      const created = await request(app)
        .post("/api/v1/tasks")
        .send({ title: "Status test" });

      const res = await request(app)
        .patch(`/api/v1/tasks/${created.body.data.id}/status`)
        .send({ status: "COMPLETED" });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/tasks/:id", () => {
    it("deletes a task", async () => {
      const created = await request(app)
        .post("/api/v1/tasks")
        .send({ title: "Delete me" });

      const res = await request(app).delete(
        `/api/v1/tasks/${created.body.data.id}`
      );

      expect(res.status).toBe(204);

      const getRes = await request(app).get(
        `/api/v1/tasks/${created.body.data.id}`
      );
      expect(getRes.status).toBe(404);
    });
  });
});
