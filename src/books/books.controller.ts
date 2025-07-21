import { Body, Controller, Post } from "@nestjs/common";

import { BooksService } from "./books.service";
import { CreateBookBodyDto } from "./dto/create-book.dto";

@Controller({
  path: '/books',
  version: '1'
})
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('/create')
  async createBook(@Body() body: CreateBookBodyDto) {
    return await this.booksService.createBook(body);
  }
}
