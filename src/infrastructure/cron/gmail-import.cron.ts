import { Injectable, Inject, Logger, ForbiddenException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { IGMAIL_SERVICE } from 'src/domain/gmail/service/gmail.service';
import { ImportEmailsUseCase } from 'src/application/gmail/use-cases/import-emails.usecase';
import { CheckPlanFeatureUseCase } from 'src/application/plans/use-cases/check-plan-feature.usecase';
import { IUserPreferencesRepository, USER_PREFERENCES_REPOSITORY } from 'src/domain/user-preferences/repositories/user-preferences.repository';

@Injectable()
export class GmailImportCron {
  private readonly logger = new Logger(GmailImportCron.name);

  constructor(
    private readonly importEmailsUseCase: ImportEmailsUseCase,
    @Inject(IGMAIL_SERVICE) private readonly gmailService,
    private readonly checkPlanFeature: CheckPlanFeatureUseCase,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handle() {
    this.logger.log('CRON — Import Gmail démarré…');

    const users = await this.gmailService.getAllConnectedUsers();
    if (users.length === 0) {
      this.logger.log('Aucun utilisateur connecté à Gmail.');
      return;
    }

    for (const user of users) {
      try {
        await this.checkPlanFeature.checkAutoImport(user.userId);
        const preferences = await this.userPreferencesRepository.getByUserId(user.userId);
        if (!preferences || !preferences.autoImport) {
          continue;
        }

        const result = await this.importEmailsUseCase.execute({
          userId: user.userId,
        });

        this.logger.log(
          `Import Gmail pour user=${user.userId} → ${result.imported} nouveaux messages`,
        );

      } catch (err: any) {
        if (err instanceof ForbiddenException) {
          this.logger.error(
            `Erreur import Gmail pour user=${user.userId}: ${err.message}`,
          );
          continue;
        }
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        this.logger.error(
          `Erreur import Gmail pour user=${user.userId}: ${errorMessage}`,
        );

        if (
          errorMessage.includes('invalid_grant') ||
          errorMessage.includes('insufficient authentication scopes') ||
          errorMessage.includes('Gmail token has been revoked') ||
          err?.code === 'invalid_grant'
        ) {
          try {
            await this.gmailService.removeInvalidToken(user.userId);
            this.logger.warn(
              `Token Gmail invalide supprimé pour user=${user.userId}. L'utilisateur devra se reconnecter.`,
            );
          } catch (deleteError) {
            this.logger.error(
              `Erreur lors de la suppression du token pour user=${user.userId}: ${deleteError}`,
            );
          }
        }
      }
    }
  }
}