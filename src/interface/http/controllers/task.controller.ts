import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import type {
  CreateTaskUseCase,
  GetTaskUseCase,
  ListTasksUseCase,
  UpdateTaskUseCase,
  UpdateTaskStatusUseCase,
  DeleteTaskUseCase,
} from "../../../application/use-cases/index.js";

export class TaskController {
  constructor(
    private readonly createTask: CreateTaskUseCase,
    private readonly getTask: GetTaskUseCase,
    private readonly listTasks: ListTasksUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly updateTaskStatus: UpdateTaskStatusUseCase,
    private readonly deleteTask: DeleteTaskUseCase
  ) {}

  handleCreate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.createTask.execute(req.body);
      res.status(StatusCodes.CREATED).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  handleGetById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.getTask.execute(id);
      res.status(StatusCodes.OK).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  handleList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.listTasks.execute(req.query as never);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  handleUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.updateTask.execute(id, req.body);
      res.status(StatusCodes.OK).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  handleUpdateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.updateTaskStatus.execute(id, req.body);
      res.status(StatusCodes.OK).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  handleDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.deleteTask.execute(id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };
}
