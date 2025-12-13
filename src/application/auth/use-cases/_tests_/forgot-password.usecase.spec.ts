import { NotFoundException } from '@nestjs/common';
import { createUserRepoMock } from 'src/tests/mocks/user-repo.mock';
import { createPasswordResetServiceMock } from 'src/tests/mocks/password-reset-service.mock';
import { createMailerServiceMock } from 'src/tests/mocks/mailer-service.mock';
import { ForgotPasswordUseCase } from '../forgot-password.usecase';

describe('ForgotPasswordUseCase', () => {
    let useCase: ForgotPasswordUseCase;
    let userRepo: ReturnType<typeof createUserRepoMock>;
    let passwordResetService: ReturnType<typeof createPasswordResetServiceMock>;
    let mailerService: ReturnType<typeof createMailerServiceMock>;

    beforeEach(() => {
        userRepo = createUserRepoMock();
        passwordResetService = createPasswordResetServiceMock();
        mailerService = createMailerServiceMock();

        useCase = new ForgotPasswordUseCase(
            userRepo,
            passwordResetService,
            mailerService,
        );
    });

    it('should throw NotFoundException when user does not exist', async () => {
        userRepo.findByEmail.mockResolvedValue(null);

        await expect(useCase.execute('nonexistent@example.com')).rejects.toThrow(
            NotFoundException,
        );
        expect(userRepo.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
        expect(passwordResetService.generateResetToken).not.toHaveBeenCalled();
        expect(mailerService.sendResetPasswordEmail).not.toHaveBeenCalled();
    });

    it('should generate reset token and send email when user exists', async () => {
        const user = { id: 'user1', email: 'user@example.com' };
        userRepo.findByEmail.mockResolvedValue(user as any);
        passwordResetService.generateResetToken.mockResolvedValue('reset-token-123');

        await useCase.execute('user@example.com');

        expect(userRepo.findByEmail).toHaveBeenCalledWith('user@example.com');
        expect(passwordResetService.generateResetToken).toHaveBeenCalledWith('user1');
        expect(mailerService.sendResetPasswordEmail).toHaveBeenCalledWith(
            'user@example.com',
            'reset-token-123',
        );
    });
});
