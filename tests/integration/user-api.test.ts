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

describe("User API", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    const taskRepository = new InMemoryTaskRepository();
    const userRepository = new InMemoryUserRepository();
    app = createApp({ taskRepository, userRepository, logger: noopLogger });
  });

  describe("POST /api/v1/users", () => {
    it("creates a user with default role", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .send({ name: "Alice", email: "alice@example.com" });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("Alice");
      expect(res.body.data.email).toBe("alice@example.com");
      expect(res.body.data.role).toBe("MEMBER");
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.createdAt).toBeDefined();
    });

    it("creates a user with explicit role", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .send({ name: "Bob", email: "bob@example.com", role: "ADMIN" });

      expect(res.status).toBe(201);
      expect(res.body.data.role).toBe("ADMIN");
    });

    it("rejects missing name", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .send({ email: "no-name@example.com" });

      expect(res.status).toBe(400);
    });

    it("rejects empty name", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .send({ name: "", email: "empty@example.com" });

      expect(res.status).toBe(400);
    });

    it("rejects missing email", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .send({ name: "No Email" });

      expect(res.status).toBe(400);
    });

    it("rejects invalid email format", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .send({ name: "Bad Email", email: "not-an-email" });

      expect(res.status).toBe(400);
    });

    it("rejects invalid role", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .send({ name: "Bad Role", email: "role@example.com", role: "SUPERADMIN" });

      expect(res.status).toBe(400);
    });

    it("rejects name longer than 100 characters", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .send({ name: "a".repeat(101), email: "long@example.com" });

      expect(res.status).toBe(400);
    });

    it("returns 409 for duplicate email", async () => {
      await request(app)
        .post("/api/v1/users")
        .send({ name: "First", email: "dup@example.com" });

      const res = await request(app)
        .post("/api/v1/users")
        .send({ name: "Second", email: "dup@example.com" });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe("CONFLICT");
    });
  });
});
