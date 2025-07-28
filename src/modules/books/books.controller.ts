import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  UpdateBookByCodeBodyDto,
  UpdateBookByCodeParamDto,
} from './dto/update-book-by-code.dto';
import { BooksService } from './books.service';
import { FindBooksQueryDto } from './dto/find-books.dto';
import { CreateBookBodyDto } from './dto/create-book.dto';
import { FindBookByCode } from './dto/find-book-by-code.dto';
import { DeleteBookByCodeParamDto } from './dto/delete-book-by-code.dto';

@Controller({
  path: '/books',
  version: '1',
})
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('/create')
  async createBook(@Body() body: CreateBookBodyDto) {
    return await this.booksService.createBook(body);
  }

  @Patch('/update/:code')
  async updateBookByCode(
    @Param() param: UpdateBookByCodeParamDto,
    @Body() body: UpdateBookByCodeBodyDto,
  ) {
    return await this.booksService.updateBookByCode(param, body);
  }

  @Delete('/delete/:code')
  async deleteBookByCode(@Param() param: DeleteBookByCodeParamDto) {
    return await this.booksService.deleteBookByCode(param);
  }

  @Get('/find')
  async findBooks(@Query() query: FindBooksQueryDto) {
    return await this.booksService.findBooks(query);
  }

  @Get('/find/:code')
  async findBpokByCode(@Param() param: FindBookByCode) {
    return await this.booksService.findBookByCode(param);
  }
}
