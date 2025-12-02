import { Module } from '@nestjs/common';

import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './interfaces/http/auth/auth.module';
import { TicketsModule } from './interfaces/http/tickets/tickets.module';
import { IdGeneratorModule } from './infrastructure/shared/id-generator/id-generator.module';
import { OpenAiModule } from './infrastructure/integrations/openai/openai.module';
import { StatsHttpModule } from './interfaces/http/stats/stats-http.module';
import { GmailHttpModule } from './interfaces/http/gmail/gmail-http.module';
import { CronModule } from './infrastructure/cron/cron.module';
import { UserPreferencesModule } from './interfaces/http/user-preferences/user-preferences-http';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TicketsModule,
    IdGeneratorModule,
    OpenAiModule,
    StatsHttpModule,
    GmailHttpModule,
    CronModule,
    UserPreferencesModule
  ],
})
export class AppModule {}