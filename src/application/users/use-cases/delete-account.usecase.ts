import { Inject, Injectable } from '@nestjs/common';

import { IUserRepository, USER_REPOSITORY } from 'src/domain/users/repositories/user.repository';

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }
}
