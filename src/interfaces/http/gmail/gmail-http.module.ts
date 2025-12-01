import { Module } from '@nestjs/common';

import { GmailModule as GmailInfraModule } from 'src/infrastructure/integrations/gmail/gmail.module';
import { GetGmailAuthUrlUseCase } from 'src/application/gmail/use-cases/get-gmail-auth-url.usecase';
import { HandleGmailCallbackUseCase } from 'src/application/gmail/use-cases/handle-gmail-callback.usecase';
import { ImportEmailsUseCase } from 'src/application/gmail/use-cases/import-emails.usecase';
import { TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { PrismaTicketRepository } from 'src/infrastructure/repositories/prisma-ticket.repository';
import { ID_GENERATOR, IIdGenerator } from 'src/domain/shared/services/id-generator.service';
import { UuidGeneratorService } from 'src/infrastructure/shared/id-generator/uuid-id-generator.service';
import { IGMAIL_SERVICE } from 'src/domain/gmail/service/gmail.service';
import { GMAIL_TOKEN_REPOSITORY } from 'src/domain/gmail/repositories/gmail-token.repository';
import { PrismaGmailTokenRepository } from 'src/infrastructure/gmail/prisma-gmail-token.repository';
import { GetGmailStatusUseCase } from 'src/application/gmail/use-cases/get-gmail-status.usecase';

import { GmailController } from './gmail.controller';

@Module({
  imports: [GmailInfraModule],

  controllers: [GmailController],

  providers: [
    {
      provide: GMAIL_TOKEN_REPOSITORY,
      useClass: PrismaGmailTokenRepository,
    },
    GetGmailStatusUseCase,
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
      inject: [IGMAIL_SERVICE],
    },
    {
      provide: HandleGmailCallbackUseCase,
      useFactory: (gmailService) =>
        new HandleGmailCallbackUseCase(gmailService),
      inject: [IGMAIL_SERVICE],
    },
    {
      provide: ImportEmailsUseCase,
      useFactory: (gmailService, ticketRepo, idGenerator: IIdGenerator) =>
        new ImportEmailsUseCase(gmailService, ticketRepo, idGenerator),
      inject: [IGMAIL_SERVICE, TICKET_REPOSITORY, ID_GENERATOR],
    },
  ],
})
export class GmailHttpModule {}