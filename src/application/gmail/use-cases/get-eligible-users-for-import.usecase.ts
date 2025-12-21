import { Inject, Injectable } from '@nestjs/common';
import { IGmailTokenRepository, GMAIL_TOKEN_REPOSITORY } from 'src/domain/gmail/repositories/gmail-token.repository';

export class GetEligibleUsersForImportOutput {
    constructor(
        public readonly userIds: string[],
    ) {}
}

@Injectable()
export class GetEligibleUsersForImportUseCase {
    constructor(
        @Inject(GMAIL_TOKEN_REPOSITORY)
        private readonly gmailTokenRepository: IGmailTokenRepository,
    ) {}

    async execute(plan: 'pro' | 'business'): Promise<GetEligibleUsersForImportOutput> {
        const users = await this.gmailTokenRepository.findUsersEligibleForAutoImport(plan);
        return new GetEligibleUsersForImportOutput(users.map(u => u.userId));
    }
}