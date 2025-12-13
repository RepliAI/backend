import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserInput {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}