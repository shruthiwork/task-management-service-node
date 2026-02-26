import { UserRole } from "../../domain/value-objects/user-role.js";

export interface CreateUserDto {
  name: string;
  email: string;
  role?: UserRole;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
