import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { IMessageRepository } from '../../domain/tickets/repositories/message.repository';
import { Message } from '../../domain/tickets/entities/message.entity';

@Injectable()
export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByGmailId(gmailId: string): Promise<Message | null> {
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
      record.threadId ?? undefined,
      record.isRisky ?? false,
    );
  }

  async create(message: Message): Promise<void> {
    await this.prisma.message.create({
      data: {
        id: message.id,
        ticketId: message.ticketId,
        gmailId: message.gmailId,
        from: message.from,
        to: message.to,
        content: message.content,
        date: message.date,
        threadId: message.threadId ?? null,
        isRisky: message.isRisky ?? false,
      },
    });
  }
}