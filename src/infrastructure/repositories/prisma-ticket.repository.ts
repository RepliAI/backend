import { Injectable } from '@nestjs/common';

import { ITicketRepository, ListTicketsParams, PaginatedTicketsResult } from 'src/domain/tickets/repositories/ticket.repository';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';

import { PrismaService } from '../prisma/prisma.service';
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
      include: {
        messages: {
          orderBy: { date: 'asc' }
        }
      }
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
      },
    });
  }

  async update(ticket: Ticket): Promise<void> {
    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        subject: ticket.subject,
        status: ticket.status,
      },
    });
  }

  async findBySubjectAndUser(subject: string, userId: string): Promise<Ticket | null> {
    const record = await this.prisma.ticket.findFirst({
      where: { subject, userId },
      include: { messages: true },
    });
  
    if (!record) return null;
    return PrismaTicketMapper.toDomain(record);
  }

  async addMessage(ticketId: string, message: Message): Promise<void> {
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
      },
    });
  }
  
  async findMessageByGmailId(gmailId: string): Promise<Message | null> {
    const record = await this.prisma.message.findUnique({
      where: { gmailId },
    });
  
    if (!record) return null;
  
    return new Message(
      record.id,
      record.ticketId,
      record.gmailId,
      record.from,
      record.to,
      record.content,
      record.date,
    );
  }

  async updateStatus(ticketId: string, status: string): Promise<void> {
    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });
  }
  async findByThreadId(threadId: string): Promise<Ticket | null> {
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
}