import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokensUseCase } from 'src/application/users/use-cases/refresh-token.usecase';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(RefreshTokensUseCase)
        private readonly refreshTokensUseCase: RefreshTokensUseCase,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        
        const authHeader = request.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');
        const refreshToken = request.headers['x-refresh-token'] as string;

        if (token && refreshToken) {
            try {
                const payload = this.jwtService.decode(token) as any;

                if (payload && payload.exp) {
                    const expirationTime = payload.exp * 1000;
                    const now = Date.now();
                    const timeUntilExpiration = expirationTime - now;

                    if (timeUntilExpiration > 0 && timeUntilExpiration < 10 * 60 * 1000) {
                        try {
                            const newTokens = await this.refreshTokensUseCase.execute(refreshToken);

                            response.setHeader('X-New-Access-Token', newTokens.accessToken);
                            response.setHeader('X-New-Refresh-Token', newTokens.refreshToken);
                        } catch (error) {
                        }
                    }
                }
            } catch (error) {
            }
        }
        return next.handle();
    }
}