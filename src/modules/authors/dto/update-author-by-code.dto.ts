import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAuthorByCodeParamDto {
  @IsNotEmpty()
  code: string;
}

export class UpdateAuthorByCodeBodyDto {
  @IsString()
  @IsOptional()
  fullName?: string;
}
