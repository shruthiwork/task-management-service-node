import { Router } from "express";
import type { UserController } from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema } from "../validators/index.js";

export function createUserRouter(controller: UserController): Router {
  const router = Router();

  router.post(
    "/",
    validate(createUserSchema, "body"),
    controller.handleCreate
  );

  return router;
}
