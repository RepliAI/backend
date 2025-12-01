import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { GmailService } from './gmail.service';
import { IGMAIL_SERVICE } from 'src/domain/gmail/service/gmail.service';

@Module({
  imports: [PrismaModule],
  providers: [
    GmailService,
    {
      provide: IGMAIL_SERVICE,
      useExisting: GmailService,
    },
  ],
  exports: [IGMAIL_SERVICE],
})
export class GmailModule {}