import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ImportEmailsUseCase } from 'src/application/gmail/use-cases/import-emails.usecase';
import { TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { ID_GENERATOR } from 'src/domain/shared/services/id-generator.service';

import { GmailModule } from '../integrations/gmail/gmail.module';
import { PrismaTicketRepository } from '../repositories/prisma-ticket.repository';
import { UuidGeneratorService } from '../shared/id-generator/uuid-id-generator.service';
import { GmailImportCron } from './gmail-import.cron';



@Module({
  imports: [
    ScheduleModule.forRoot(),
    GmailModule,
  ],
  providers: [
    GmailImportCron,
    {
      provide: TICKET_REPOSITORY,
      useClass: PrismaTicketRepository,
    },
    {
      provide: ID_GENERATOR,
      useClass: UuidGeneratorService,
    },
    ImportEmailsUseCase,
  ],
})
export class CronModule {}
