import { IsNotEmpty } from 'class-validator';

export class FindStudentByCode {
  @IsNotEmpty()
  code: string;
}
