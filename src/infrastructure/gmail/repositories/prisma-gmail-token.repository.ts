import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import { IGmailTokenRepository } from "src/domain/gmail/repositories/gmail-token.repository";

@Injectable()
export class PrismaGmailTokenRepository implements IGmailTokenRepository {
    private readonly logger = new Logger(PrismaGmailTokenRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async hasToken(userId: string): Promise<boolean> {
        const token = await this.prisma.gmailToken.findUnique({
            where: { userId },
        });
        return !!token;
    }

    async findUsersEligibleForAutoImport(plan: 'pro' | 'business'): Promise<{ userId: string }[]> {
        const planLower = plan.toLowerCase();
        
        const allTokens = await this.prisma.gmailToken.findMany({
            select: {
                userId: true,
                user: {
                    select: {
                        subscription: {
                            select: {
                                plan: true,
                                status: true,
                            },
                        },
                        preferences: {
                            select: {
                                autoImport: true,
                            },
                        },
                    },
                },
            },
        });

        const eligibleTokens = allTokens.filter(token => {
            const sub = token.user.subscription;
            const prefs = token.user.preferences;
            
            const hasValidSubscription = sub?.plan?.toLowerCase() === planLower && sub?.status === 'active';
            const hasAutoImportEnabled = prefs?.autoImport === true;
            
            if (hasValidSubscription && !hasAutoImportEnabled) {
                this.logger.debug(`User ${token.userId} has plan ${planLower} but autoImport is ${prefs?.autoImport}`);
            }
            if (!hasValidSubscription && prefs?.autoImport) {
                this.logger.debug(`User ${token.userId} has autoImport enabled but subscription is ${sub?.plan}/${sub?.status}`);
            }
            
            return hasValidSubscription && hasAutoImportEnabled;
        });

        this.logger.log(`Found ${eligibleTokens.length} eligible users for plan ${planLower} out of ${allTokens.length} connected users`);
        
        return eligibleTokens.map(token => ({ userId: token.userId }));
    }
}