import { Module } from '@nestjs/common';

import { GmailModule as GmailInfraModule } from 'src/infrastructure/integrations/gmail/gmail.module';
import { GetGmailAuthUrlUseCase } from 'src/application/gmail/use-cases/get-gmail-auth-url.usecase';
import { HandleGmailCallbackUseCase } from 'src/application/gmail/use-cases/handle-gmail-callback.usecase';
import { ImportEmailsUseCase } from 'src/application/gmail/use-cases/import-emails.usecase';
import { TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { PrismaTicketRepository } from 'src/infrastructure/repositories/prisma-ticket.repository';
import { ID_GENERATOR, IIdGenerator } from 'src/domain/shared/services/id-generator.service';
import { UuidGeneratorService } from 'src/infrastructure/shared/id-generator/uuid-id-generator.service';

import { GmailController } from './gmail.controller';

@Module({
  imports: [GmailInfraModule],

  controllers: [GmailController],

  providers: [
    {
      provide: TICKET_REPOSITORY,
      useClass: PrismaTicketRepository,
    },
    {
      provide: ID_GENERATOR,
      useClass: UuidGeneratorService,
    },
    {
      provide: GetGmailAuthUrlUseCase,
      useFactory: (gmailService) =>
        new GetGmailAuthUrlUseCase(gmailService),
      inject: ['IGmailService'],
    },
    {
      provide: HandleGmailCallbackUseCase,
      useFactory: (gmailService) =>
        new HandleGmailCallbackUseCase(gmailService),
      inject: ['IGmailService'],
    },
    {
      provide: ImportEmailsUseCase,
      useFactory: (gmailService, ticketRepo, idGenerator: IIdGenerator) =>
        new ImportEmailsUseCase(gmailService, ticketRepo, idGenerator),
      inject: ['IGmailService', TICKET_REPOSITORY, ID_GENERATOR],
    },
  ],
})
export class GmailHttpModule {}