import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './interfaces/http/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
