import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { createUserRepoMock } from 'src/tests/mocks/user-repo.mock';
import { createAuthTokenServiceMock } from 'src/tests/mocks/auth-token-service.mock';
import { RefreshTokensUseCase } from '../refresh-token.usecase';

describe('RefreshTokensUseCase', () => {
  let useCase: RefreshTokensUseCase;
  let userRepo: ReturnType<typeof createUserRepoMock>;
  let tokenService: ReturnType<typeof createAuthTokenServiceMock>;
  let jwtService: JwtService;

  beforeEach(() => {
    userRepo = createUserRepoMock();
    tokenService = createAuthTokenServiceMock();
    jwtService = new JwtService({
      secret: process.env.JWT_REFRESH_SECRET || 'test-secret',
    });

    useCase = new RefreshTokensUseCase(
      userRepo as any,
      tokenService as any,
      jwtService as any
    );
  });

  it('should refresh tokens', async () => {
    const refreshToken = await jwtService.signAsync({ sub: 'user1' });
    const refreshHash = await bcrypt.hash(refreshToken, 10);

    userRepo.findById.mockResolvedValue({
      id: 'user1',
      refreshTokenHash: refreshHash,
    });

    const res = await useCase.execute(refreshToken);

    expect(res.accessToken).toBe('access-token');
    expect(res.refreshToken).toBe('refresh-token');
  }, 10000);

  it('should throw on invalid refresh token', async () => {
    await expect(useCase.execute('invalid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});