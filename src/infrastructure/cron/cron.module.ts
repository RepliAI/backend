import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { GmailApplicationModule } from 'src/application/gmail/gmail-application.module';
import { GmailModule } from '../integrations/gmail/gmail.module';
import { GmailImportCron } from './gmail-import.cron';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GmailApplicationModule,
    GmailModule,
  ],
  providers: [
    GmailImportCron,
  ],
})
export class CronModule { }