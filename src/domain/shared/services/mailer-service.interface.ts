export const I_MAILER_SERVICE = "I_MAILER_SERVICE";

export interface IMailerService {
  sendResetPasswordEmail(to: string, token: string): Promise<void>;
  sendTemplate(options: {
    to: string;
    subject: string;
    template: string;
    variables: Record<string, any>;
  }): Promise<void>;
}

