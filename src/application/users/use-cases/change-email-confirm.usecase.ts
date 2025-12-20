import { Inject, Injectable, BadRequestException, ConflictException } from '@nestjs/common';

import { IUserRepository, USER_REPOSITORY } from 'src/domain/users/repositories/user.repository';
import { IPasswordResetService, PASSWORD_RESET_SERVICE } from 'src/domain/auth/services/password-reset.service';

@Injectable()
export class ChangeEmailConfirmUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_RESET_SERVICE)
    private readonly passwordResetService: IPasswordResetService,
  ) {}

  async execute(token: string): Promise<void> {
    let payload: { userId: string; newEmail: string };

    try {
      payload = await this.passwordResetService.verifyEmailChangeToken(token);
    } catch {
      throw new BadRequestException('Lien invalide ou expiré.');
    }

    const { userId, newEmail } = payload;

    const existingUser = await this.userRepository.findByEmail(newEmail);
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Cette adresse email est déjà utilisée.');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('Utilisateur introuvable.');
    }

    if (user.email === newEmail) {
      throw new BadRequestException("L'adresse email est identique à l'actuelle.");
    }

    await this.userRepository.updateEmail(userId, newEmail);
  }
}
