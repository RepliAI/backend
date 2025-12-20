import { Inject, Injectable, ForbiddenException } from '@nestjs/common';

import { IPlanLimitsService, PLAN_LIMITS } from 'src/domain/plans/services/plan-limits.service';
import { BILLING_SERVICE, BillingService } from 'src/domain/billing/services/billing.service';
import { IGmailTokenRepository, GMAIL_TOKEN_REPOSITORY } from 'src/domain/gmail/repositories/gmail-token.repository';
import { PlanType } from 'src/domain/plans/entities/plan-limits.entity';

@Injectable()
export class CheckGmailAccountLimitUseCase {
  constructor(
    @Inject(PLAN_LIMITS)
    private readonly planLimitsService: IPlanLimitsService,
    @Inject(BILLING_SERVICE)
    private readonly billingService: BillingService,
    @Inject(GMAIL_TOKEN_REPOSITORY)
    private readonly gmailTokenRepository: IGmailTokenRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const subscription = await this.billingService.getActiveSubscription(userId);
    const plan = (subscription.plan?.toLowerCase() || 'free') as PlanType; // Ajouter || 'free'
    
    const maxAccounts = this.planLimitsService.getMaxGmailAccounts(plan);
    
    // Pour l'instant, on a un seul token par user (relation unique dans le schema)
    // Pour BUSINESS (3 comptes), il faudra adapter quand le multi-gmail sera implémenté
    const hasExistingAccount = await this.gmailTokenRepository.hasToken(userId);
    
    if (hasExistingAccount && maxAccounts === 1) {
      throw new ForbiddenException(
        `Votre plan ${plan} permet ${maxAccounts} compte Gmail. Veuillez supprimer le compte existant avant d'en ajouter un nouveau.`
      );
    }
    
    // TODO: Quand multi-gmail sera implémenté, compter vraiment les comptes existants
    // et vérifier contre maxAccounts
  }
}