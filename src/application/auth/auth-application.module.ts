import { Module } from '@nestjs/common';

import { UsersInfrastructureModule } from 'src/infrastructure/users/users-infrastructure.module';
import { AuthInfrastructureModule } from 'src/infrastructure/auth/auth-infrastructure.module';
import { MailerModule } from 'src/infrastructure/mailer/mailer.module';

import { ForgotPasswordUseCase } from './use-cases/forgot-password.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';

@Module({
  imports: [
    UsersInfrastructureModule,
    AuthInfrastructureModule,
    MailerModule,
  ],
  providers: [
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
  ],
  exports: [
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
  ],
})
export class AuthApplicationModule {}