import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { IUserRepository, USER_REPOSITORY } from 'src/domain/users/repositories/user.repository';
import { RegisterUserInput } from '../dto/register-user.input';
import { User } from 'src/domain/users/entities/user.entity';
import { UserAlreadyExistsError } from 'src/domain/shared/errors/user-already-exist.errors';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: RegisterUserInput): Promise<void> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new UserAlreadyExistsError(input.email);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = new User(
      randomUUID(),
      input.email,
      passwordHash,
    );

    await this.userRepository.create(user);
  }
}