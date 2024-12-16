import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class AddToCartDto {
  @IsInt({ message: 'Variant ID must be an integer' })
  @IsPositive({ message: 'Variant ID must be a positive number' })
  variantId: number;

  @IsInt({ message: 'Quantity must be an integer' })
  @IsPositive({ message: 'Quantity must be a positive number' })
  quantity: number;

  @IsString()
  @IsNotEmpty()
  username: string;
}

export class UpdateCartDto extends PartialType(AddToCartDto) {}

export class RemoveCartItemDto {
  @IsInt({ message: 'Variant ID must be an integer' })
  @IsPositive({ message: 'Variant ID must be a positive number' })
  variantId: number;

  @IsString()
  @IsNotEmpty()
  username: string;
}
