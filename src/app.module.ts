import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './interfaces/http/auth/auth.module';
import { TicketsModule } from './interfaces/http/tickets/tickets.module';
import { IdGeneratorModule } from './infrastructure/shared/id-generator/id-generator.module';
import { OpenAiModule } from './infrastructure/integrations/openai/openai.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TicketsModule,
    IdGeneratorModule,
    OpenAiModule,
  ],
})
export class AppModule {}
