import { Message } from 'src/domain/tickets/entities/message.entity';

export class MessageResponseDto {
  id: string;
  from: string;
  to: string;
  content: string;
  date: Date;

  static fromDomain(message: Message): MessageResponseDto {
    const dto = new MessageResponseDto();
    dto.id = message.id;
    dto.from = message.from;
    dto.to = message.to;
    dto.content = message.content;
    dto.date = message.date;
    return dto;
  }
}