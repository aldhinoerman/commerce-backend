import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of Category',
    example: 'Electronics',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
