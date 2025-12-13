import { Inject, Injectable } from "@nestjs/common";
import { IGmailTokenRepository, GMAIL_TOKEN_REPOSITORY } from "src/domain/gmail/repositories/gmail-token.repository";

export class GetGmailStatusOutput {
  constructor(public readonly connected: boolean) {}
}

@Injectable()
export class GetGmailStatusUseCase {
  constructor(
    @Inject(GMAIL_TOKEN_REPOSITORY)
    private readonly gmailTokenRepo: IGmailTokenRepository,
  ) {}

  async execute(userId: string): Promise<GetGmailStatusOutput> {
    const connected = await this.gmailTokenRepo.hasToken(userId);
    return new GetGmailStatusOutput(connected);
  }
}