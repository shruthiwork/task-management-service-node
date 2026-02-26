import { describe, it, expect, beforeEach } from "vitest";
import { CreateUserUseCase } from "../../../src/application/use-cases/create-user.use-case.js";
import { InMemoryUserRepository } from "../../../src/infrastructure/repositories/in-memory-user.repository.js";
import type { Logger } from "../../../src/application/interfaces/index.js";
import { UserRole } from "../../../src/domain/value-objects/user-role.js";
import { ConflictError } from "../../../src/domain/errors/index.js";

const noopLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

describe("CreateUserUseCase", () => {
  let repo: InMemoryUserRepository;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    useCase = new CreateUserUseCase(repo, noopLogger);
  });

  it("creates a user and returns response DTO", async () => {
    const result = await useCase.execute({
      name: "Alice",
      email: "alice@example.com",
      role: UserRole.ADMIN,
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe("Alice");
    expect(result.email).toBe("alice@example.com");
    expect(result.role).toBe(UserRole.ADMIN);
    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
  });

  it("defaults role to MEMBER", async () => {
    const result = await useCase.execute({
      name: "Bob",
      email: "bob@example.com",
    });

    expect(result.role).toBe(UserRole.MEMBER);
  });

  it("persists the user in the repository", async () => {
    const result = await useCase.execute({
      name: "Carol",
      email: "carol@example.com",
    });

    const found = await repo.findById(result.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Carol");
  });

  it("rejects duplicate email", async () => {
    await useCase.execute({
      name: "Dave",
      email: "dave@example.com",
    });

    await expect(
      useCase.execute({ name: "Dave 2", email: "dave@example.com" })
    ).rejects.toThrow(ConflictError);
  });
});
