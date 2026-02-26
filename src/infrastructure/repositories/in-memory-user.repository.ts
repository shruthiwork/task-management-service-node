import { User } from "../../domain/entities/index.js";
import type { UserRepository } from "../../domain/repositories/index.js";

export class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.email === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const found = await this.findByEmail(email);
    return found !== null;
  }
}
