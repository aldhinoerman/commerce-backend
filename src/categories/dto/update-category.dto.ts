import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  id: number;
}
