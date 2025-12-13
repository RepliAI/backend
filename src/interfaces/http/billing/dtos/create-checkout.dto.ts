import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCheckoutDTO {
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsString()
  @IsNotEmpty()
  plan: string;
}