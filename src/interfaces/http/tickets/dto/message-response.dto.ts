import { IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { Message } from 'src/domain/tickets/entities/message.entity';

export class MessageResponseDto {
  @IsString()
  id: string;

  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsString()
  content: string;

  @IsDate()
  @Type(() => Date)
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