import { v4 as uuidv4 } from "uuid";
import { UserRole } from "../value-objects/user-role.js";
import { ValidationError } from "../errors/index.js";

export interface UserProps {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private props: UserProps) {}

  static create(params: {
    name: string;
    email: string;
    role?: UserRole;
  }): User {
    const now = new Date();

    if (!params.name || params.name.trim().length === 0) {
      throw new ValidationError("Name is required");
    }

    if (params.name.trim().length > 100) {
      throw new ValidationError("Name must be 100 characters or fewer");
    }

    if (!params.email || params.email.trim().length === 0) {
      throw new ValidationError("Email is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email.trim())) {
      throw new ValidationError("Email must be a valid email address");
    }

    return new User({
      id: uuidv4(),
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      role: params.role ?? UserRole.MEMBER,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: UserProps): User {
    return new User({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get email(): string {
    return this.props.email;
  }
  get role(): UserRole {
    return this.props.role;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}
