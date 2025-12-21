import { IsEmail, IsNotEmpty } from 'class-validator';

export class ChangeEmailRequestDto {
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}
