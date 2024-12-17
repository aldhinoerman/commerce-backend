import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto, CreateVariantDto } from './create-product.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class UpdateVariantDto extends PartialType(CreateVariantDto) {}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}
