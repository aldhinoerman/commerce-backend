import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto, CreateVariantDto } from './create-product.dto';
import { IsOptional, IsArray } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsArray()
  variants?: CreateVariantDto[];
}
