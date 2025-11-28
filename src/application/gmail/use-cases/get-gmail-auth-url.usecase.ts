import { Inject } from '@nestjs/common';

import { IGmailService } from 'src/domain/gmail/service/gmail.service';

import { GetGmailAuthUrlInput, GetGmailAuthUrlOutput } from '../dto/get-gmail-url.dto';

export class GetGmailAuthUrlUseCase {
  constructor(
    @Inject('IGmailService')
    private readonly gmailService: IGmailService,
  ) {}

  async execute(input: GetGmailAuthUrlInput): Promise<GetGmailAuthUrlOutput> {
    const url = this.gmailService.generateAuthUrl(input.userId);

    return new GetGmailAuthUrlOutput(url);
  }
}
