import { IsEmail, IsInt, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;
}

export class UpdateUserParams {
  @IsInt()
  id: number;
}
