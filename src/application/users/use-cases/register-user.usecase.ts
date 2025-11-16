import { Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/users/repositories/user.repository';
import { RegisterUserInput } from '../dto/register-user.input';
import { User } from '../../../domain/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: RegisterUserInput): Promise<void> {
    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = new User(
      randomUUID(),
      input.email,
      passwordHash,
    );

    await this.userRepository.create(user);
  }
}
