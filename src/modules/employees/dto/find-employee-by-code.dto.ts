import { IsNotEmpty } from 'class-validator';

export class FindEmployeeByCode {
  @IsNotEmpty()
  code: string;
}
