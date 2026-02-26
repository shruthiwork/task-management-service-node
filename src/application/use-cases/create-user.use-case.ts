import { User } from "../../domain/entities/index.js";
import type { UserRepository } from "../../domain/repositories/index.js";
import { ConflictError } from "../../domain/errors/index.js";
import type { Logger } from "../interfaces/index.js";
import type { CreateUserDto, UserResponseDto } from "../dtos/index.js";
import { toUserResponse } from "./user-mapper.js";

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    const emailExists = await this.userRepository.existsByEmail(dto.email);
    if (emailExists) {
      throw new ConflictError(
        `A user with email '${dto.email}' already exists`
      );
    }

    const user = User.create({
      name: dto.name,
      email: dto.email,
      role: dto.role,
    });

    await this.userRepository.save(user);
    this.logger.info("User created", { userId: user.id });

    return toUserResponse(user);
  }
}
