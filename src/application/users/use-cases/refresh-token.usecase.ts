import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { AUTH_TOKEN_SERVICE, IAuthTokenService } from "src/application/auth/services/auth-token.service";
import { IUserRepository, USER_REPOSITORY } from "src/domain/users/repositories/user.repository";

@Injectable()
export class RefreshTokensUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(AUTH_TOKEN_SERVICE)
        private readonly authTokenService: IAuthTokenService,
        private readonly jwtService: JwtService,
    ){}

    async execute(refreshToken: string): Promise<{accessToken: string, refreshToken: string}> {
        let payload:any;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET
            })
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const userId = payload.userId as string;
        const user = await this.userRepository.findById(userId);

        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const newAccessToken = await this.authTokenService.signAccessToken(user.id);
        const newRefreshToken = await this.authTokenService.signRefreshToken(user.id);
        const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);

        await this.userRepository.updateRefreshTokenHash(user.id, newRefreshHash);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          };
    }
}