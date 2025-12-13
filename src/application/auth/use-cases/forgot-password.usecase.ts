import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { MailerService } from 'src/infrastructure/mailer/mailer.service';
import {
  IPasswordResetService,
  PASSWORD_RESET_SERVICE,
} from 'src/domain/auth/services/password-reset.service';
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/domain/users/repositories/user.repository';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,

    @Inject(PASSWORD_RESET_SERVICE)
    private readonly passwordReset: IPasswordResetService,

    private readonly mailer: MailerService,
  ) { }

  async execute(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user)
      throw new NotFoundException("Aucun compte n'est associé à cet email.");

    const token = await this.passwordReset.generateResetToken(user.id);
    await this.mailer.sendResetPasswordEmail(email, token);
  }
}