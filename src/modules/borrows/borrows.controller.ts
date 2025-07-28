import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { BorrowsService } from './borrows.service';
import { CreateBorrowBodyDto } from './dto/create-borrow.dto';
import { FindBorrowsQueryDto } from './dto/find-borrows.dto';
import { FindBorrowByCode } from './dto/find-borrow-by-code.dto';

@Controller({
  path: '/borrows',
  version: '1',
})
export class BorrowsController {
  constructor(private readonly boorowsService: BorrowsService) {}

  @Post('/create')
  async createBorrow(@Body() body: CreateBorrowBodyDto) {
    return await this.boorowsService.createBorrow(body);
  }

  @Get('/find')
  async findBorrows(@Query() query: FindBorrowsQueryDto) {
    return await this.boorowsService.findBorrows(query);
  }

  @Get('/find/:bookCode/:studentCode')
  async findBorrowsByCode(@Param() param: FindBorrowByCode) {
    return await this.boorowsService.findBorrowByCode(param);
  }
}
