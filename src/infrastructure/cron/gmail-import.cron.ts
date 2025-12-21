// backend/src/infrastructure/cron/gmail-import.cron.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ImportEmailsUseCase } from 'src/application/gmail/use-cases/import-emails.usecase';
import { GetEligibleUsersForImportUseCase } from 'src/application/gmail/use-cases/get-eligible-users-for-import.usecase';
import { IGMAIL_SERVICE } from 'src/domain/gmail/service/gmail.service';

@Injectable()
export class GmailImportCron {
  private readonly logger = new Logger(GmailImportCron.name);

  constructor(
    private readonly importEmailsUseCase: ImportEmailsUseCase,
    private readonly getEligibleUsersUseCase: GetEligibleUsersForImportUseCase,
    @Inject(IGMAIL_SERVICE) private readonly gmailService,
  ) {}

  @Cron('*/30 * * * * *')
  async handleBusinessImport() {
    await this.handleImport('business');
  }

  @Cron('0 */2 * * * *')
  async handleProImport() {
    await this.handleImport('pro');
  }

  private async handleImport(plan: 'pro' | 'business') {
    this.logger.log(`CRON — Import Gmail pour plan ${plan} démarré…`);

    try {
      const eligibleUsers = await this.getEligibleUsersUseCase.execute(plan);
      
      if (eligibleUsers.userIds.length === 0) {
        this.logger.log(`Aucun utilisateur ${plan} éligible pour l'import automatique.`);
        return;
      }

      this.logger.log(`${eligibleUsers.userIds.length} utilisateur(s) ${plan} éligible(s).`);

      const importPromises = eligibleUsers.userIds.map(userId =>
        this.processUserImport(userId, plan)
      );

      await Promise.allSettled(importPromises);

    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des utilisateurs ${plan}: ${error.message}`);
    }
  }

  private async processUserImport(userId: string, plan: string): Promise<void> {
    try {
      const result = await this.importEmailsUseCase.execute({ userId });

      this.logger.log(
        `Import Gmail pour user=${userId} (plan ${plan}) → ${result.imported} nouveaux messages`,
      );

    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || 'Unknown error';
      this.logger.error(
        `Erreur import Gmail pour user=${userId} (plan ${plan}): ${errorMessage}`,
      );

      if (
        errorMessage.includes('invalid_grant') ||
        errorMessage.includes('insufficient authentication scopes') ||
        errorMessage.includes('Gmail token has been revoked') ||
        err?.code === 'invalid_grant'
      ) {
        try {
          await this.gmailService.removeInvalidToken(userId);
          this.logger.warn(
            `Token Gmail invalide supprimé pour user=${userId}. L'utilisateur devra se reconnecter.`,
          );
        } catch (deleteError) {
          this.logger.error(
            `Erreur lors de la suppression du token pour user=${userId}: ${deleteError}`,
          );
        }
      }
    }
  }
}