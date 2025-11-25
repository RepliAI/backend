import { TicketResponseDto } from './ticket-response.dto';

export class ListTicketsResponseDto {
  items: TicketResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}