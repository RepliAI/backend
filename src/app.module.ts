import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './interfaces/http/auth/auth.module';
import { TicketsModule } from './interfaces/http/tickets/tickets.module';
import { IdGeneratorModule } from './infrastructure/shared/id-generator/id-generator.module';
import { OpenAiModule } from './infrastructure/integrations/openai/openai.module';
import { StatsHttpModule } from './interfaces/http/stats/stats-http.module';
import { GmailHttpModule } from './interfaces/http/gmail/gmail-http.module';
import { CronModule } from './infrastructure/cron/cron.module';
import { UserPreferencesModule } from './interfaces/http/user-preferences/user-preferences-http';
import { BillingHttpModule } from './interfaces/http/billing/billing-http.module';
import { ProfileHttpModule } from './interfaces/http/profile/profile-http.module';
import { WebSocketModule } from './infrastructure/websocket/websocket.module';
import { TokenRefreshInterceptor } from './interfaces/http/auth/interceptors/token-refresh.interceptor';

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
    UserPreferencesModule,
    BillingHttpModule,
    ProfileHttpModule,
    WebSocketModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useExisting: TokenRefreshInterceptor,
    },
  ],
})
export class AppModule { }