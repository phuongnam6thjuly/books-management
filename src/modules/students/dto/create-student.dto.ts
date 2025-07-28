import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { EStudentUniversity } from '../enums/student-university.enum';

export class CreateStudentBodyDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(EStudentUniversity)
  @IsString()
  @IsNotEmpty()
  university: string;

  @IsString()
  @IsNotEmpty()
  major: string;

  @IsNumber()
  @IsNotEmpty()
  borrowCount: number;
}
