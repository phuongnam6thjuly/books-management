import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBorrowBodyDto {
  @IsString()
  @IsNotEmpty()
  bookCode: string;

  @IsString()
  @IsNotEmpty()
  studentCode: string;

  @IsString()
  @IsNotEmpty()
  borrowDate: Date;

  @IsString()
  @IsNotEmpty()
  returnDate: Date;
}
