import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";
import * as Handlebars from "handlebars";
import { IMailerService } from "src/domain/shared/services/mailer-service.interface";

@Injectable()
export class MailerService implements IMailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!,
      },
    });
  }

  private compileTemplate(templateName: string, variables: Record<string, unknown>): string {
    const templatePath = path.join(
      __dirname,
      "templates",
      `${templateName}.hbs`
    );

    const templateContent = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateContent);

    return template(variables);
  }

  async sendTemplate(options: {
    to: string;
    subject: string;
    template: string;
    variables: Record<string, any>;
  }) {
    const html = this.compileTemplate(options.template, options.variables);

    try {
      await this.transporter.sendMail({
        from: `"RepliAI" <${process.env.MAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html,
      });
    } catch (err) {
      console.error("Email sending error:", err);
      throw new InternalServerErrorException("Impossible d'envoyer l'email.");
    }
  }

  async sendResetPasswordEmail(to: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    return this.sendTemplate({
      to,
      subject: "Réinitialisation de votre mot de passe",
      template: "reset-password",
      variables: { resetUrl },
    });
  }
}