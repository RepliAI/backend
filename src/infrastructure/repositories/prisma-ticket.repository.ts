import { Injectable } from '@nestjs/common';
import { ITicketRepository, ListTicketsParams, PaginatedTicketsResult } from '../../domain/tickets/repositories/ticket.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Ticket } from '../../domain/tickets/entities/ticket.entity';
import { PrismaTicketMapper } from './mappers/prisma-ticket.mapper';

@Injectable()
export class PrismaTicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<Ticket[]> {
    const result = await this.prisma.ticket.findMany({
      where: { userId },
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
    });

    return result.map(PrismaTicketMapper.toDomain);
  }

  async listWithFilters(params: ListTicketsParams): Promise<PaginatedTicketsResult> {
    const { userId, status, search, page, pageSize } = params;

    const where: any = { userId };

    if (params.from || params.to) {
      where.createdAt = {};
    
      if (params.from) {
        where.createdAt.gte = params.from;
      }
      if (params.to) {
        where.createdAt.lte = params.to;
      }
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        {
          messages: {
            some: {
              content: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        include: { messages: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      items: rows.map(PrismaTicketMapper.toDomain),
      total,
    };
  }

  async findById(id: string, userId: string): Promise<Ticket | null> {
    const result = await this.prisma.ticket.findFirst({
      where: { id, userId },
      include: { messages: true },
    });

    if (!result) return null;
    return PrismaTicketMapper.toDomain(result);
  }

  async create(ticket: Ticket): Promise<void> {
    await this.prisma.ticket.create({
      data: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt,
        userId: ticket.userId,
        messages: {
          create: ticket.messages.map((message) => ({
            id: message.id,
            from: message.from,
            to: message.to,
            content: message.content,
            date: message.date,
          })),
        },
      },
    });
  }

  async update(ticket: Ticket): Promise<void> {
    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        subject: ticket.subject,
        status: ticket.status,
        messages: {
          deleteMany: {},
          create: ticket.messages.map(message => ({
            id: message.id,
            from: message.from,
            to: message.to,
            content: message.content,
            date: message.date,
          })),
        },
      },
    });
  }
}
