import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ImportEmailsInput {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class ImportEmailsOutput {
  @IsNumber()
  @Min(0)
  imported: number;
}