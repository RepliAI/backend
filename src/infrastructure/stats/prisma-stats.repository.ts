import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IStatsRepository, TicketStats } from 'src/domain/stats/repositories/stats.repository';

@Injectable()
export class PrismaStatsRepository implements IStatsRepository {
  constructor(private readonly prisma: PrismaService) { }

  async getStats(userId: string, days: number = 14): Promise<TicketStats> {
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - days);

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

    const periodTickets = await this.getTicketsBetween(userId, from, now);
    
    const periodOpen = periodTickets.filter(t => t.status === 'OPEN').length;
    const periodPending = periodTickets.filter(t => t.status === 'PENDING').length;
    const periodResolved = periodTickets.filter(t => t.status === 'RESOLVED').length;
    return {
      total,
      open,
      pending,
      resolved,
      lastTickets,
      period: {
        from,
        to: now,
        tickets: periodTickets,
        summary: {
          open: periodOpen,
          pending: periodPending,
          resolved: periodResolved,
        },
      },
    };
  }

  async getTicketsBetween(userId: string, from: Date, to: Date) {
    return this.prisma.ticket.findMany({
      where: {
        userId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        subject: true,
        createdAt: true,
        status: true,
      },
    });
  }
}