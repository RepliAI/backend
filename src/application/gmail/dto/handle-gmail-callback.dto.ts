import { IsString, IsNotEmpty } from 'class-validator';

export class HandleGmailCallbackInput {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  stateUserId: string;
}