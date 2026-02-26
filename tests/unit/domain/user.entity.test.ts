import { describe, it, expect } from "vitest";
import { User } from "../../../src/domain/entities/user.entity.js";
import { UserRole } from "../../../src/domain/value-objects/user-role.js";
import { ValidationError } from "../../../src/domain/errors/index.js";

describe("User Entity", () => {
  it("creates a user with defaults", () => {
    const user = User.create({ name: "Alice", email: "alice@example.com" });

    expect(user.id).toBeDefined();
    expect(user.name).toBe("Alice");
    expect(user.email).toBe("alice@example.com");
    expect(user.role).toBe(UserRole.MEMBER);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it("creates a user with explicit role", () => {
    const user = User.create({
      name: "Bob",
      email: "bob@example.com",
      role: UserRole.ADMIN,
    });

    expect(user.role).toBe(UserRole.ADMIN);
  });

  it("normalises email to lowercase", () => {
    const user = User.create({
      name: "Carol",
      email: "Carol@Example.COM",
    });

    expect(user.email).toBe("carol@example.com");
  });

  it("trims name and email", () => {
    const user = User.create({
      name: "  Dave  ",
      email: "  dave@example.com  ",
    });

    expect(user.name).toBe("Dave");
    expect(user.email).toBe("dave@example.com");
  });

  it("rejects empty name", () => {
    expect(() =>
      User.create({ name: "", email: "a@b.com" })
    ).toThrow(ValidationError);
    expect(() =>
      User.create({ name: "   ", email: "a@b.com" })
    ).toThrow(ValidationError);
  });

  it("rejects name longer than 100 chars", () => {
    expect(() =>
      User.create({ name: "a".repeat(101), email: "a@b.com" })
    ).toThrow(ValidationError);
  });

  it("rejects empty email", () => {
    expect(() =>
      User.create({ name: "Eve", email: "" })
    ).toThrow(ValidationError);
  });

  it("rejects invalid email format", () => {
    expect(() =>
      User.create({ name: "Eve", email: "not-an-email" })
    ).toThrow(ValidationError);
  });

  it("returns a plain object from toJSON", () => {
    const user = User.create({ name: "Frank", email: "frank@example.com" });
    const json = user.toJSON();

    expect(json.id).toBe(user.id);
    expect(json.name).toBe("Frank");
    expect(json.email).toBe("frank@example.com");
    expect(json.role).toBe(UserRole.MEMBER);
  });
});
