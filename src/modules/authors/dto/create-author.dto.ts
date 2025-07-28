import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthorBodyDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}
