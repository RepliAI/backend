import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTicketInput {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  gmailId?: string;
}