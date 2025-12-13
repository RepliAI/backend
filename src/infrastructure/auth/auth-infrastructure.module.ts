import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AUTH_TOKEN_SERVICE } from 'src/application/auth/services/auth-token.service';
import { PASSWORD_RESET_SERVICE } from 'src/domain/auth/services/password-reset.service';

import { JwtAuthTokenService } from './services/jwt-auth-token.service';
import { PasswordResetService } from './password-reset.service';

@Module({
  imports: [
    JwtModule.register({}),
  ],
  providers: [
    {
      provide: AUTH_TOKEN_SERVICE,
      useClass: JwtAuthTokenService,
    },
    {
      provide: PASSWORD_RESET_SERVICE,
      useClass: PasswordResetService,
    },
  ],
  exports: [
    JwtModule,
    AUTH_TOKEN_SERVICE,
    PASSWORD_RESET_SERVICE,
  ],
})
export class AuthInfrastructureModule {}