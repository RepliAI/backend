import { IsArray, IsNumber, Min } from 'class-validator';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';

export class PaginatedTicketsOutput {
  @IsArray()
  items: Ticket[];

  @IsNumber()
  @Min(0)
  total: number;

  @IsNumber()
  @Min(1)
  page: number;

  @IsNumber()
  @Min(1)
  pageSize: number;
}