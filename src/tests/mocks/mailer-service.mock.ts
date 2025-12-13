import { MailerService } from 'src/infrastructure/mailer/mailer.service';

export function createMailerServiceMock(): jest.Mocked<MailerService> {
    return {
        sendResetPasswordEmail: jest.fn(),
        sendEmail: jest.fn(),
    } as any;
}