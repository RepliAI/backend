import { Module } from '@nestjs/common';

import { GmailApplicationModule } from 'src/application/gmail/gmail-application.module';

import { GmailController } from './gmail.controller';

@Module({
  imports: [
    GmailApplicationModule,
  ],
  controllers: [GmailController],
})
export class GmailHttpModule {}