import { BadRequestException } from '@nestjs/common';
import { createUserRepoMock } from 'src/tests/mocks/user-repo.mock';
import { createPasswordResetServiceMock } from 'src/tests/mocks/password-reset-service.mock';
import { ResetPasswordUseCase } from '../reset-password.usecase';

jest.mock('bcrypt', () => ({
    hash: jest.fn((password: string) => Promise.resolve(`hashed-${password}`)),
}));

describe('ResetPasswordUseCase', () => {
    let useCase: ResetPasswordUseCase;
    let userRepo: ReturnType<typeof createUserRepoMock>;
    let passwordResetService: ReturnType<typeof createPasswordResetServiceMock>;

    beforeEach(() => {
        userRepo = createUserRepoMock();
        passwordResetService = createPasswordResetServiceMock();

        useCase = new ResetPasswordUseCase(userRepo, passwordResetService);
    });

    it('should throw BadRequestException when token is invalid', async () => {
        passwordResetService.verifyResetToken.mockRejectedValue(new Error('Invalid token'));

        await expect(useCase.execute('invalid-token', 'newPassword123')).rejects.toThrow(
            BadRequestException,
        );
        expect(passwordResetService.verifyResetToken).toHaveBeenCalledWith('invalid-token');
        expect(userRepo.updatePassword).not.toHaveBeenCalled();
    });

    it('should update password when token is valid', async () => {
        const payload = { userId: 'user1' };
        passwordResetService.verifyResetToken.mockResolvedValue(payload);

        await useCase.execute('valid-token', 'newPassword123');

        expect(passwordResetService.verifyResetToken).toHaveBeenCalledWith('valid-token');
        expect(userRepo.updatePassword).toHaveBeenCalledWith('user1', 'hashed-newPassword123');
    });
});
