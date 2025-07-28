import { IsNotEmpty } from 'class-validator';

export class DeleteBookByCodeParamDto {
  @IsNotEmpty()
  code: string;
}
