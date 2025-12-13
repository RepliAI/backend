import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddMessageInput {
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  gmailId?: string;
}