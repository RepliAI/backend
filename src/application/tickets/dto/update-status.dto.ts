import { IsEnum } from 'class-validator';
import { TicketStatus } from 'src/domain/tickets/value-objects/ticket-status.vo';

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  status: TicketStatus;
}