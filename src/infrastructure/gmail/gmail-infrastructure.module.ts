import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { GmailModule as GmailIntegrationModule } from '../integrations/gmail/gmail.module';
import { GMAIL_TOKEN_REPOSITORY } from 'src/domain/gmail/repositories/gmail-token.repository';
import { PrismaGmailTokenRepository } from './repositories/prisma-gmail-token.repository';

@Module({
  imports: [
    PrismaModule,
    GmailIntegrationModule,
  ],
  providers: [
    {
      provide: GMAIL_TOKEN_REPOSITORY,
      useClass: PrismaGmailTokenRepository,
    },
  ],
  exports: [
    GMAIL_TOKEN_REPOSITORY,
    GmailIntegrationModule,
  ],
})
export class GmailInfrastructureModule {}