import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { UserPreferences } from "src/domain/user-preferences/entities/user-preferences.entity";
import { IUserPreferencesRepository } from "src/domain/user-preferences/repositories/user-preferences.repository";

@Injectable()
export class PrismaUserPreferencesRepository implements IUserPreferencesRepository {
  constructor(private prisma: PrismaService) {}

  async getByUserId(userId: string): Promise<UserPreferences | null> {
    const prefs = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!prefs) return null;

    return new UserPreferences(
      prefs.id,
      prefs.userId,
      prefs.tone,
      prefs.signature,
      prefs.autoImport,
      prefs.autoAiSend,
    );
  }

  async upsert(userId: string, data: { tone: string; signature: string }): Promise<UserPreferences> {
    const prefs = await this.prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data },
    });

    return new UserPreferences(
      prefs.id,
      prefs.userId,
      prefs.tone,
      prefs.signature,
      prefs.autoImport,
      prefs.autoAiSend,
    );
  }
}