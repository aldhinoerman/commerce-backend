import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class StockOpnameDto {
  @IsInt()
  @IsNotEmpty()
  variantId: number;

  @IsInt()
  @IsNotEmpty()
  adjustment: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
