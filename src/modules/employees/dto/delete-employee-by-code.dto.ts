import { IsNotEmpty } from 'class-validator';

export class DeleteEmployeeByCodeParamDto {
  @IsNotEmpty()
  code: string;
}
