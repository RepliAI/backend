import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../domain/tickets/repositories/ticket.repository';
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
