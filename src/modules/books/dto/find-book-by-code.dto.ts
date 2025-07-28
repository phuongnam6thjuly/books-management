import { IsNotEmpty } from 'class-validator';

export class FindBookByCode {
  @IsNotEmpty()
  code: string;
}
