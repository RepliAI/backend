import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthTokenService } from 'src/application/auth/services/auth-token.service';

@Injectable()
export class JwtAuthTokenService implements IAuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async signAccessToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { userId },
      {
        secret: process.env.JWT_ACCESS_SECRET as string,
        expiresIn: 60 * 15,
      },
    );
  }
  
  async signRefreshToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { userId },
      {
        secret: process.env.JWT_REFRESH_SECRET as string,
        expiresIn: 60 * 60 * 24 * 7,
      },
    );
  }
  
}
