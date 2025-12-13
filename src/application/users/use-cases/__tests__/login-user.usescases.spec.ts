import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { createUserRepoMock } from 'src/tests/mocks/user-repo.mock';
import { createAuthTokenServiceMock } from 'src/tests/mocks/auth-token-service.mock';
import { LoginUserUseCase } from '../login-user.usecase';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: ReturnType<typeof createUserRepoMock>;
  let tokenService: ReturnType<typeof createAuthTokenServiceMock>;

  beforeEach(() => {
    userRepository = createUserRepoMock();
    tokenService = createAuthTokenServiceMock();

    useCase = new LoginUserUseCase(
      userRepository as any,
      tokenService as any
    );
  });

  it('should login successfully', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user1',
      email: 'test@test.com',
      passwordHash: await bcrypt.hash('password123', 10),
    });

    const res = await useCase.execute({
      email: 'test@test.com',
      password: 'password123',
    });

    expect(res.accessToken).toBe('access-token');
    expect(res.refreshToken).toBe('refresh-token');
    expect(userRepository.updateRefreshTokenHash).toHaveBeenCalled();
  });

  it('should throw if credentials invalid (email)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'fake@test.com',
        password: '123',
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw if password invalid', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      passwordHash: await bcrypt.hash('password123', 10),
    });

    await expect(
      useCase.execute({
        email: 'test@test.com',
        password: 'wrong',
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});