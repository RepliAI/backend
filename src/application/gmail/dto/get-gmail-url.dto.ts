import { IsString, IsNotEmpty } from 'class-validator';

export class GetGmailAuthUrlInput {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class GetGmailAuthUrlOutput {
  @IsString()
  @IsNotEmpty()
  url: string;
}