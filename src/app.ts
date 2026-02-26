import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import type { TaskRepository } from "./domain/repositories/index.js";
import type { UserRepository } from "./domain/repositories/index.js";
import type { Logger } from "./application/interfaces/index.js";
import {
  CreateTaskUseCase,
  GetTaskUseCase,
  ListTasksUseCase,
  UpdateTaskUseCase,
  UpdateTaskStatusUseCase,
  DeleteTaskUseCase,
  CreateUserUseCase,
} from "./application/use-cases/index.js";
import { TaskController } from "./interface/http/controllers/index.js";
import { UserController } from "./interface/http/controllers/index.js";
import {
  createTaskRouter,
  createHealthRouter,
  createUserRouter,
} from "./interface/http/routes/index.js";
import {
  createErrorHandler,
  createRequestLogger,
} from "./interface/http/middleware/index.js";
import { openApiSpec } from "./interface/http/swagger/index.js";

export interface AppDependencies {
  taskRepository: TaskRepository;
  userRepository: UserRepository;
  logger: Logger;
}

export function createApp(deps: AppDependencies): express.Application {
  const app = express();

  // Global middleware
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(createRequestLogger(deps.logger));

  // Use cases
  const createTask = new CreateTaskUseCase(deps.taskRepository, deps.logger);
  const getTask = new GetTaskUseCase(deps.taskRepository);
  const listTasks = new ListTasksUseCase(deps.taskRepository);
  const updateTask = new UpdateTaskUseCase(deps.taskRepository, deps.logger);
  const updateTaskStatus = new UpdateTaskStatusUseCase(
    deps.taskRepository,
    deps.logger
  );
  const deleteTask = new DeleteTaskUseCase(deps.taskRepository, deps.logger);

  // User use cases
  const createUser = new CreateUserUseCase(deps.userRepository, deps.logger);

  // Controllers
  const taskController = new TaskController(
    createTask,
    getTask,
    listTasks,
    updateTask,
    updateTaskStatus,
    deleteTask
  );
  const userController = new UserController(createUser);

  // Swagger UI
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.get("/docs.json", (_req, res) => {
    res.json(openApiSpec);
  });

  // Routes
  app.use("/", createHealthRouter());
  app.use("/api/v1/tasks", createTaskRouter(taskController));
  app.use("/api/v1/users", createUserRouter(userController));

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found", code: "NOT_FOUND" });
  });

  // Error handler (must be last)
  app.use(createErrorHandler(deps.logger));

  return app;
}
