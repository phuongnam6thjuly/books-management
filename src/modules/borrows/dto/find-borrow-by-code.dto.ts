import { IsNotEmpty } from 'class-validator';

export class FindBorrowByCode {
  @IsNotEmpty()
  bookCode: string;

  @IsNotEmpty()
  studentCode: string;
}
