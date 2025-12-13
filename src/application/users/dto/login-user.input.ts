import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginUserInput {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}