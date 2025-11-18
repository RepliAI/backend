import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './interfaces/http/auth/auth.module';
import { TicketsModule } from './interfaces/http/tickets/tickets.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TicketsModule
  ],
})
export class AppModule {}
