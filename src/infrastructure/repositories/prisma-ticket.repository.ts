import { Injectable } from '@nestjs/common';

import { ITicketRepository, ListTicketsParams, PaginatedTicketsResult } from 'src/domain/tickets/repositories/ticket.repository';
import { Ticket as TicketEntity } from 'src/domain/tickets/entities/ticket.entity';
import { Message as MessageEntity } from 'src/domain/tickets/entities/message.entity';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaTicketMapper } from './mappers/prisma-ticket.mapper';
import { TicketWhereClause } from '../shared/types/where-clause.type';

@Injectable()
export class PrismaTicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAllByUser(userId: string): Promise<TicketEntity[]> {
    const result = await this.prisma.ticket.findMany({
      where: { userId },
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
    });

    return result.map(PrismaTicketMapper.toDomain);
  }

  async listWithFilters(params: ListTicketsParams): Promise<PaginatedTicketsResult> {
    const { userId, status, search, page, pageSize } = params;

    const andConditions: any[] = [{ userId }];

    if (params.from || params.to) {
      const dateCondition: any = {};
      if (params.from) {
        dateCondition.gte = params.from;
      }
      if (params.to) {
        dateCondition.lte = params.to;
      }
      andConditions.push({ createdAt: dateCondition });
    }

    if (status) {
      andConditions.push({ status });
    }

    if (params.isRisky === true) {
      andConditions.push({
        messages: {
          some: {
            isRisky: true,
          },
        },
      });
    }

    if (search) {
      const searchConditions: any[] = [
        { subject: { contains: search, mode: 'insensitive' } },
      ];

      if (params.isRisky === true) {
        searchConditions.push({
          messages: {
            some: {
              AND: [
                { isRisky: true },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        });
      } else {
        searchConditions.push({
          messages: {
            some: {
              content: { contains: search, mode: 'insensitive' },
            },
          },
        });
      }

      andConditions.push({ OR: searchConditions });
    }

    const where = andConditions.length === 1 ? andConditions[0] : { AND: andConditions };

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

  async findById(id: string, userId: string): Promise<TicketEntity | null> {
    const result = await this.prisma.ticket.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!result) return null;
    return PrismaTicketMapper.toDomain(result);
  }

  async create(ticket: TicketEntity): Promise<void> {
    await this.prisma.ticket.create({
      data: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt,
        userId: ticket.userId,
      },
    });
  }

  async update(ticket: TicketEntity): Promise<void> {
    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        subject: ticket.subject,
        status: ticket.status,
      },
    });
  }

  async findBySubjectAndUser(subject: string, userId: string): Promise<TicketEntity | null> {
    const record = await this.prisma.ticket.findFirst({
      where: { subject, userId },
      include: { messages: true },
    });

    if (!record) return null;
    return PrismaTicketMapper.toDomain(record);
  }

  async addMessage(ticketId: string, message: MessageEntity): Promise<void> {
    await this.prisma.message.create({
      data: {
        id: message.id,
        ticketId,
        gmailId: message.gmailId,
        threadId: message.threadId,
        from: message.from,
        to: message.to,
        content: message.content,
        date: message.date,
        isRisky: message.isRisky ?? false,
      },
    });
  }

  async findMessageByGmailId(gmailId: string): Promise<MessageEntity | null> {
    const record = await this.prisma.message.findUnique({
      where: { gmailId },
    });

    if (!record) return null;

    return new MessageEntity(
      record.id,
      record.ticketId,
      record.gmailId,
      record.from,
      record.to,
      record.content,
      record.date,
      record.threadId ?? undefined,
      record.isRisky ?? false,
    );
  }

  async updateStatus(ticketId: string, status: string): Promise<void> {
    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });
  }
  async findByThreadId(threadId: string): Promise<TicketEntity | null> {
    const msg = await this.prisma.message.findFirst({
      where: { threadId },
      include: {
        ticket: {
          include: { messages: true },
        },
      },
    });

    if (!msg) return null;

    return PrismaTicketMapper.toDomain(msg.ticket);
  }

  async markMessageAsRisky(messageId: string): Promise<void> {
    await this.prisma.message.update({
      where: { id: messageId },
      data: { isRisky: true },
    });
  }
}