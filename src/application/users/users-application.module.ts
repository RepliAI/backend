import { Module } from '@nestjs/common';

import { UsersInfrastructureModule } from 'src/infrastructure/users/users-infrastructure.module';
import { AuthInfrastructureModule } from 'src/infrastructure/auth/auth-infrastructure.module';
import { GmailInfrastructureModule } from 'src/infrastructure/gmail/gmail-infrastructure.module';
import { BillingInfrastructureModule } from 'src/infrastructure/billing/billing-infrastructure.module';
import { MailerModule } from 'src/infrastructure/mailer/mailer.module';

import { RegisterUserUseCase } from './use-cases/register-user.usecase';
import { LoginUserUseCase } from './use-cases/login-user.usecase';
import { RefreshTokensUseCase } from './use-cases/refresh-token.usecase';
import { GetProfileUseCase } from './use-cases/get-profile.usecase';
import { ChangeEmailRequestUseCase } from './use-cases/change-email-request.usecase';
import { ChangeEmailConfirmUseCase } from './use-cases/change-email-confirm.usecase';
import { DeleteAccountUseCase } from './use-cases/delete-account.usecase';

@Module({
    imports: [
        UsersInfrastructureModule,
        AuthInfrastructureModule,
        GmailInfrastructureModule,
        BillingInfrastructureModule,
        MailerModule,
    ],
    providers: [
        RegisterUserUseCase,
        LoginUserUseCase,
        RefreshTokensUseCase,
        GetProfileUseCase,
        ChangeEmailRequestUseCase,
        ChangeEmailConfirmUseCase,
        DeleteAccountUseCase,
    ],
    exports: [
        RegisterUserUseCase,
        LoginUserUseCase,
        RefreshTokensUseCase,
        GetProfileUseCase,
        ChangeEmailRequestUseCase,
        ChangeEmailConfirmUseCase,
        DeleteAccountUseCase,
    ],
})
export class UsersApplicationModule { }