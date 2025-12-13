import { Inject, Injectable } from '@nestjs/common';

import { IGMAIL_SERVICE, IGmailService } from 'src/domain/gmail/service/gmail.service';

import { HandleGmailCallbackInput } from '../dto/handle-gmail-callback.dto';

@Injectable()
export class HandleGmailCallbackUseCase {
  constructor(
    @Inject(IGMAIL_SERVICE)
    private readonly gmailService: IGmailService,
  ) {}

  async execute(input: HandleGmailCallbackInput): Promise<void> {
    await this.gmailService.handleOAuthCallback(
      input.code,
      input.stateUserId,
    );
  }
}