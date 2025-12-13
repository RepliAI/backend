import { Module } from '@nestjs/common';

import { UsersInfrastructureModule } from 'src/infrastructure/users/users-infrastructure.module';
import { AuthInfrastructureModule } from 'src/infrastructure/auth/auth-infrastructure.module';

import { RegisterUserUseCase } from './use-cases/register-user.usecase';
import { LoginUserUseCase } from './use-cases/login-user.usecase';
import { RefreshTokensUseCase } from './use-cases/refresh-token.usecase';

@Module({
  imports: [
    UsersInfrastructureModule,
    AuthInfrastructureModule,
  ],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokensUseCase,
  ],
  exports: [
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokensUseCase,
  ],
})
export class UsersApplicationModule {}
