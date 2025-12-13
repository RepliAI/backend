import { IsArray, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TicketResponseDto } from './ticket-response.dto';

export class ListTicketsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketResponseDto)
  items: TicketResponseDto[];

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