import { IsNotEmpty } from 'class-validator';

export class FindAuthorByCode {
  @IsNotEmpty()
  code: string;
}
