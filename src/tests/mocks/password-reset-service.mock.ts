import { IPasswordResetService } from 'src/domain/auth/services/password-reset.service';

export function createPasswordResetServiceMock(): jest.Mocked<IPasswordResetService> {
    return {
        generateResetToken: jest.fn(),
        verifyResetToken: jest.fn(),
        generateEmailChangeToken: jest.fn(),
        verifyEmailChangeToken: jest.fn(),
    };
}