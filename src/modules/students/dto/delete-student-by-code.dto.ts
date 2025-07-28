import { IsNotEmpty } from 'class-validator';

export class DeleteStudentByCodeParamDto {
  @IsNotEmpty()
  code: string;
}
