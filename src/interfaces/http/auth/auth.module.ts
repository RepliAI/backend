import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { RegisterUserUseCase } from '../../../application/users/use-cases/register-user.usecase';
import { PrismaUserRepository } from '../../../infrastructure/repositories/prisma-user.repository';
import { USER_REPOSITORY } from '../../../domain/users/repositories/user.repository';

@Module({
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    PrismaUserRepository,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class AuthModule {}
