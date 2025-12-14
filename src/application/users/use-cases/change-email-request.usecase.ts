import { Inject, Injectable, BadRequestException, ConflictException } from '@nestjs/common';

import { IUserRepository, USER_REPOSITORY } from 'src/domain/users/repositories/user.repository';
import { IPasswordResetService, PASSWORD_RESET_SERVICE } from 'src/domain/auth/services/password-reset.service';
import { MailerService } from 'src/infrastructure/mailer/mailer.service';

@Injectable()
export class ChangeEmailRequestUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(PASSWORD_RESET_SERVICE)
        private readonly passwordResetService: IPasswordResetService,
        private readonly mailer: MailerService,
    ) { }

    async execute(userId: string, newEmail: string): Promise<void> {
        const existingUser = await this.userRepository.findByEmail(newEmail);
        if (existingUser) {
            throw new ConflictException('Cette adresse email est déjà utilisée.');
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new BadRequestException('Utilisateur introuvable.');
        }

        if (user.email === newEmail) {
            throw new BadRequestException("L'adresse email est identique à l'actuelle.");
        }

        const token = await this.passwordResetService.generateEmailChangeToken(userId, newEmail);

        const changeEmailUrl = `${process.env.FRONTEND_URL}/change-email?token=${token}`;

        await this.mailer.sendTemplate({
            to: newEmail,
            subject: 'Confirmez votre nouvelle adresse email',
            template: 'change-email',
            variables: { changeEmailUrl, newEmail },
        });
    }
}
