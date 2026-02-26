import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import type { CreateUserUseCase } from "../../../application/use-cases/index.js";

export class UserController {
  constructor(private readonly createUser: CreateUserUseCase) {}

  handleCreate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.createUser.execute(req.body);
      res.status(StatusCodes.CREATED).json({ data: result });
    } catch (err) {
      next(err);
    }
  };
}
