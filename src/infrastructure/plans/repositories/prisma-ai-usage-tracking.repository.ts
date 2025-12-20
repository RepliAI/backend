import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { IAiUsageTrackingRepository } from 'src/domain/plans/repositories/ai-usage-tracking.repository';

@Injectable()
export class PrismaAiUsageTrackingRepository implements IAiUsageTrackingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentMonthUsage(userId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const count = await this.prisma.aiResponseUsage.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });
    
    return count;
  }

  async incrementUsage(userId: string): Promise<void> {
    await this.prisma.aiResponseUsage.create({
      data: {
        userId,
      },
    });
  }
}