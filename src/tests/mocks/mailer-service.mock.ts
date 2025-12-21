import { MailerService } from 'src/infrastructure/mailer/mailer.service';
import { IMailerService } from 'src/domain/shared/services/mailer-service.interface';

export function createMailerServiceMock(): jest.Mocked<MailerService> {
    return {
        sendResetPasswordEmail: jest.fn(),
        sendTemplate: jest.fn(),
    } as any;
}

// Alias pour compatibilité avec les nouveaux tests utilisant l'interface
export function createIMailerServiceMock(): jest.Mocked<IMailerService> {
    return {
        sendResetPasswordEmail: jest.fn(),
        sendTemplate: jest.fn(),
    } as any;
}