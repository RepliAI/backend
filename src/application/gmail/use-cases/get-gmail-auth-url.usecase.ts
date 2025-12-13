import { Inject, Injectable } from '@nestjs/common';

import { IGMAIL_SERVICE, IGmailService } from 'src/domain/gmail/service/gmail.service';

import { GetGmailAuthUrlInput, GetGmailAuthUrlOutput } from '../dto/get-gmail-url.dto';

@Injectable()
export class GetGmailAuthUrlUseCase {
  constructor(
    @Inject(IGMAIL_SERVICE)
    private readonly gmailService: IGmailService,
  ) {}

  async execute(input: GetGmailAuthUrlInput): Promise<GetGmailAuthUrlOutput> {
    const url = this.gmailService.generateAuthUrl(input.userId);

    return new GetGmailAuthUrlOutput(url);
  }
}