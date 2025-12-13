import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IGMAIL_SERVICE } from 'src/domain/gmail/service/gmail.service';
import { ImportEmailsUseCase } from 'src/application/gmail/use-cases/import-emails.usecase';

@Injectable()
export class GmailImportCron {
  private readonly logger = new Logger(GmailImportCron.name);

  constructor(
    private readonly importEmailsUseCase: ImportEmailsUseCase,
    @Inject(IGMAIL_SERVICE) private readonly gmailService,
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
        const result = await this.importEmailsUseCase.execute({
          userId: user.userId,
        });

        this.logger.log(
          `Import Gmail pour user=${user.userId} → ${result.imported} nouveaux messages`,
        );

      } catch (err) {
        this.logger.error(
          `Erreur import Gmail pour user=${user.userId}: ${err.message}`,
        );
      }
    }
  }
}