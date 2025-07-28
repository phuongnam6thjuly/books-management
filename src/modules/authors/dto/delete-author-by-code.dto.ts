import { IsNotEmpty } from 'class-validator';

export class DeleteAuthorByCodeParamDto {
  @IsNotEmpty()
  code: string;
}
