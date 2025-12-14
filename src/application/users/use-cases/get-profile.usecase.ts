import { Inject, Injectable } from '@nestjs/common';

import { IUserRepository, USER_REPOSITORY } from 'src/domain/users/repositories/user.repository';
import { IGmailTokenRepository, GMAIL_TOKEN_REPOSITORY } from 'src/domain/gmail/repositories/gmail-token.repository';
import { BILLING_SERVICE, BillingService } from 'src/domain/billing/services/billing.service';

export class GetProfileOutput {
    constructor(
        public readonly email: string,
        public readonly plan: 'free' | 'pro' | 'business',
        public readonly gmailConnected: boolean,
        public readonly createdAt?: string,
    ) { }
}

@Injectable()
export class GetProfileUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(GMAIL_TOKEN_REPOSITORY)
        private readonly gmailTokenRepository: IGmailTokenRepository,
        @Inject(BILLING_SERVICE)
        private readonly billingService: BillingService,
    ) { }

    async execute(userId: string): Promise<GetProfileOutput> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const subscription = await this.billingService.getActiveSubscription(userId);
        const gmailConnected = await this.gmailTokenRepository.hasToken(userId);
        const createdAt = await this.userRepository.getUserCreatedAt(userId);

        return new GetProfileOutput(
            user.email,
            subscription.plan as 'free' | 'pro' | 'business',
            gmailConnected,
            createdAt?.toISOString(),
        );
    }
}