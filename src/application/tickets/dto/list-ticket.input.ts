import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { TicketStatus } from 'src/domain/tickets/value-objects/ticket-status.vo';

export class ListTicketsInput {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsDateString()
  from?: Date;

  @IsOptional()
  @IsDateString()
  to?: Date;

  @IsOptional()
  @IsBoolean()
  isRisky?: boolean;
}