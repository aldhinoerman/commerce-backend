import {
  IsString,
  IsInt,
  IsArray,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsInt()
  @IsNotEmpty()
  stock: number;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  image: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsOptional()
  @IsArray()
  variants?: CreateVariantDto[];
}
