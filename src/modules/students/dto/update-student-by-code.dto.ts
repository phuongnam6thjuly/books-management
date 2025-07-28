import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStudentByCodeParamDto {
  @IsNotEmpty()
  code: string;
}

export class UpdateStudentByCodeBodyDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  major?: string;

  @IsNumber()
  @IsOptional()
  borrowCount?: number;
}
