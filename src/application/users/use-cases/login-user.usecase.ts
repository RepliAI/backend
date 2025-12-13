import * as bcrypt from 'bcrypt';
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AUTH_TOKEN_SERVICE, IAuthTokenService } from "src/application/auth/services/auth-token.service";
import { IUserRepository, USER_REPOSITORY } from "src/domain/users/repositories/user.repository"
import { LoginUserInput } from "../dto/login-user.input";

@Injectable()
export class LoginUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(AUTH_TOKEN_SERVICE)
        private readonly authTokenService: IAuthTokenService,
    ) {}

    async execute(input: LoginUserInput): Promise<{accessToken: string, refreshToken: string}> {
        const user = await this.userRepository.findByEmail(input.email);
        if(!user){
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        
        if(!isValid){
            throw new UnauthorizedException('Invalid credentials');
        }
        
        const accessToken = await this.authTokenService.signAccessToken(user.id);
        const refreshToken = await this.authTokenService.signRefreshToken(user.id);
        
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await this.userRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

        return {
            accessToken,
            refreshToken,
        };

    }
}

