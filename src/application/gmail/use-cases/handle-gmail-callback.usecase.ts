import { Inject } from '@nestjs/common';

import { IGmailService } from 'src/domain/gmail/service/gmail.service';

import { HandleGmailCallbackInput } from '../dto/handle-gmail-callback.dto';


export class HandleGmailCallbackUseCase {
  constructor(
    @Inject('IGmailService')
    private readonly gmailService: IGmailService,
  ) {}

  async execute(input: HandleGmailCallbackInput): Promise<void> {
    await this.gmailService.handleOAuthCallback(
      input.code,
      input.stateUserId,
    );
  }
}