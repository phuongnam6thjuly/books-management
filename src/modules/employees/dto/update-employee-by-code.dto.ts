import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeByCodeParamDto {
  @IsNotEmpty()
  code: string;
}

export class UpdateEmployeeByCodeBodyDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
