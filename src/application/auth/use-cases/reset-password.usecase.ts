import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

import { IPasswordResetService, PASSWORD_RESET_SERVICE } from "src/domain/auth/services/password-reset.service";
import { IUserRepository, USER_REPOSITORY } from "src/domain/users/repositories/user.repository";

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,

    @Inject(PASSWORD_RESET_SERVICE)
    private readonly passwordReset: IPasswordResetService,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    let payload;

    try {
      payload = await this.passwordReset.verifyResetToken(token);
    } catch {
      throw new BadRequestException("Lien invalide ou expiré.");
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.users.updatePassword(payload.userId, hashed);
  }
}