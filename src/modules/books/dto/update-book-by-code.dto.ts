import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBookByCodeParamDto {
  @IsNotEmpty()
  code: string;
}

export class UpdateBookByCodeBodyDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  publisher: string;

  @IsNumber()
  @IsOptional()
  year: number;

  @IsString()
  @IsOptional()
  type: string;

  @IsNumber()
  @IsOptional()
  quantity: number;
}
