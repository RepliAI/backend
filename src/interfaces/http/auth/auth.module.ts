import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersApplicationModule } from 'src/application/users/users-application.module';
import { AuthApplicationModule } from 'src/application/auth/auth-application.module';
import { UsersInfrastructureModule } from 'src/infrastructure/users/users-infrastructure.module';

import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './security/jwt.strategy';
import { JwtAuthGuard } from './security/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({}),
    UsersApplicationModule,
    AuthApplicationModule,
    UsersInfrastructureModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    UsersInfrastructureModule,
  ],
})
export class AuthModule {}