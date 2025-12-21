import { IsString, IsDate, IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';

class MessageItemDto {
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

  @IsOptional()
  @IsBoolean()
  isRisky?: boolean;
}

export class TicketResponseDto {
  @IsString()
  id: string;

  @IsString()
  subject: string;

  @IsString()
  status: string;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageItemDto)
  messages: MessageItemDto[];

  static fromDomain(ticket: Ticket): TicketResponseDto {
    if (!ticket) {
      return {
        id: '',
        subject: '',
        status: '',
        createdAt: new Date(),
        messages: [],
      };
    }

    return {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt,
      messages: (ticket.messages ?? []).map((message) => ({
        id: message.id,
        from: message.from,
        to: message.to,
        content: message.content,
        date: message.date,
        isRisky: message.isRisky,
      })),
    };
  }
}