import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { RegisterUserUseCase } from 'src/application/users/use-cases/register-user.usecase';
import { PrismaUserRepository } from 'src/infrastructure/repositories/prisma-user.repository';
import { USER_REPOSITORY } from 'src/domain/users/repositories/user.repository';
import { LoginUserUseCase } from 'src/application/users/use-cases/login-user.usercase';
import { RefreshTokensUseCase } from 'src/application/users/use-cases/refresh-token.usecase';
import { JwtAuthTokenService } from 'src/infrastructure/services/jwt-auth-token.service';
import { AUTH_TOKEN_SERVICE } from 'src/application/auth/services/auth-token.service';
import { ForgotPasswordUseCase } from 'src/application/auth/use-cases/forgot-password.usecase';
import { ResetPasswordUseCase } from 'src/application/auth/use-cases/reset-password.usecase';
import { PASSWORD_RESET_SERVICE } from 'src/domain/auth/services/password-reset.service';
import { PasswordResetService } from 'src/infrastructure/auth/passwod-reset.service';
import { MailerModule } from 'src/infrastructure/mailer/mailer.module';

import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './security/jwt.strategy';
import { JwtAuthGuard } from './security/jwt-auth.guard';


@Module({
  imports: [
    JwtModule.register({}),
    MailerModule
  ],
  controllers: [AuthController],
  providers: [
    PrismaUserRepository,
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokensUseCase,
    JwtAuthTokenService,
    JwtStrategy,
    JwtAuthGuard,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    {
      provide: PASSWORD_RESET_SERVICE,
      useClass: PasswordResetService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: AUTH_TOKEN_SERVICE,
      useClass: JwtAuthTokenService,
    },
  ],
  exports: [
    USER_REPOSITORY,
    PrismaUserRepository,
  ],
})
export class AuthModule {}
