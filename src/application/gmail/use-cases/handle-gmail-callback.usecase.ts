import { Inject, Injectable } from '@nestjs/common';

import { IGMAIL_SERVICE, IGmailService } from 'src/domain/gmail/service/gmail.service';
import { CheckGmailAccountLimitUseCase } from 'src/application/plans/use-cases/check-gmail-account-limit.usecase';

import { HandleGmailCallbackInput } from '../dto/handle-gmail-callback.dto';

@Injectable()
export class HandleGmailCallbackUseCase {
  constructor(
    @Inject(IGMAIL_SERVICE)
    private readonly gmailService: IGmailService,
    private readonly checkGmailAccountLimit: CheckGmailAccountLimitUseCase,
  ) { }

  async execute(input: HandleGmailCallbackInput): Promise<void> {
    await this.checkGmailAccountLimit.execute(input.stateUserId);
    
    await this.gmailService.handleOAuthCallback(
      input.code,
      input.stateUserId,
    );
  }
}