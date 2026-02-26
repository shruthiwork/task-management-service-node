import { z } from "zod";
import { UserRole } from "../../../domain/value-objects/user-role.js";

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.nativeEnum(UserRole).optional(),
});
