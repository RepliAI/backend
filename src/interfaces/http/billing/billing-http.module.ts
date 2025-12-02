import { Module } from '@nestjs/common';

import { BillingController } from './controllers/billing.controller';

import { BillingApplicationModule } from 'src/application/billing/billing-application.module';

@Module({
  imports: [BillingApplicationModule],
  controllers: [BillingController],
})
export class BillingHttpModule {}