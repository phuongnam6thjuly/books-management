import { IsNotEmpty, IsString } from "class-validator";


export class CreateBookBodyDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}