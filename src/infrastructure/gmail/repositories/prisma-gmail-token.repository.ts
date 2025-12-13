import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IGmailTokenRepository } from "src/domain/gmail/repositories/gmail-token.repository";

@Injectable()
export class PrismaGmailTokenRepository implements IGmailTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async hasToken(userId: string): Promise<boolean> {
    const token = await this.prisma.gmailToken.findUnique({
      where: { userId },
    });
    return !!token;
  }
}

