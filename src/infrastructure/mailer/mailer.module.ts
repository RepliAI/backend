import { Module } from "@nestjs/common";
import { MailerService } from "./mailer.service";
import { I_MAILER_SERVICE } from "src/domain/shared/services/mailer-service.interface";

@Module({
  providers: [
    MailerService,
    {
      provide: I_MAILER_SERVICE,
      useExisting: MailerService,
    },
  ],
  exports: [I_MAILER_SERVICE],
})

export class MailerModule {}