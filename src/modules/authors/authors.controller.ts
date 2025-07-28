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
  UpdateAuthorByCodeBodyDto,
  UpdateAuthorByCodeParamDto,
} from './dto/update-author-by-code.dto';
import { AuthorsService } from './authors.service';
import { FindAuthorsQueryDto } from './dto/find-authors.dto';
import { CreateAuthorBodyDto } from './dto/create-author.dto';
import { FindAuthorByCode } from './dto/find-author-by-code.dto';
import { DeleteAuthorByCodeParamDto } from './dto/delete-author-by-code.dto';

@Controller({
  path: '/authors',
  version: '1',
})
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post('/create')
  async createAuthor(@Body() body: CreateAuthorBodyDto) {
    return await this.authorsService.createAuthor(body);
  }

  @Patch('/update/:code')
  async updateAuthorByCode(
    @Param() param: UpdateAuthorByCodeParamDto,
    @Body() body: UpdateAuthorByCodeBodyDto,
  ) {
    return await this.authorsService.updateAuthorByCode(param, body);
  }

  @Delete('/delete/:code')
  async deleteAuthoryCode(@Param() param: DeleteAuthorByCodeParamDto) {
    return await this.authorsService.deleteAuthorByCode(param);
  }

  @Get('/find')
  async findAuthors(@Query() query: FindAuthorsQueryDto) {
    return await this.authorsService.findAuthors(query);
  }

  @Get('/find/:code')
  async findAuthorByCode(@Param() param: FindAuthorByCode) {
    return await this.authorsService.findAuthorByCode(param);
  }
}
