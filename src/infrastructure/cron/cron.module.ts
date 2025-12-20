import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { GmailApplicationModule } from 'src/application/gmail/gmail-application.module';
import { PlansApplicationModule } from 'src/application/plans/plan-application.module';

import { GmailModule } from '../integrations/gmail/gmail.module';
import { GmailImportCron } from './gmail-import.cron';
import { UserPreferencesInfrastructureModule } from '../user-preferences/user-preference-infrastructure.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GmailApplicationModule,
    GmailModule,
    PlansApplicationModule,
    UserPreferencesInfrastructureModule,
  ],
  providers: [
    GmailImportCron,
  ],
})
export class CronModule { }