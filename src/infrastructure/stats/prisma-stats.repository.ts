import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IStatsRepository, TicketStats } from 'src/domain/stats/repositories/stats.repository';

@Injectable()
export class PrismaStatsRepository implements IStatsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: string): Promise<TicketStats> {
    const total = await this.prisma.ticket.count({ where: { userId } });

    const open = await this.prisma.ticket.count({
      where: { userId, status: 'OPEN' },
    });

    const pending = await this.prisma.ticket.count({
      where: { userId, status: 'PENDING' },
    });

    const resolved = await this.prisma.ticket.count({
      where: { userId, status: 'RESOLVED' },
    });

    const lastTickets = await this.prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        subject: true,
        createdAt: true,
      },
    });

    return {
      total,
      open,
      pending,
      resolved,
      lastTickets,
    };
  }
}