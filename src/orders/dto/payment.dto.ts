import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class PaymentDto {
  @IsInt({ message: 'Quantity must be an integer' })
  @IsPositive({ message: 'Quantity must be a positive number' })
  orderId: number;

  @IsString()
  @IsNotEmpty()
  username: string;
}
