import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { GmailService } from './gmail.service';

@Module({
  imports: [PrismaModule],
  providers: [
    GmailService,
    {
      provide: 'IGmailService',
      useExisting: GmailService,
    },
  ],
  exports: ['IGmailService'],
})
export class GmailModule {}