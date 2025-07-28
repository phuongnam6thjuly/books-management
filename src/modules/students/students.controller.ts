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
  UpdateStudentByCodeBodyDto,
  UpdateStudentByCodeParamDto,
} from './dto/update-student-by-code.dto';
import { StudentsService } from './students.service';
import { FindStudentsQueryDto } from './dto/find-students.dto';
import { CreateStudentBodyDto } from './dto/create-student.dto';
import { FindStudentByCode } from './dto/find-student-by-code.dto';
import { DeleteStudentByCodeParamDto } from './dto/delete-student-by-code.dto';

@Controller({
  path: '/students',
  version: '1',
})
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('/create')
  async createStudent(@Body() body: CreateStudentBodyDto) {
    return await this.studentsService.createStudent(body);
  }

  @Patch('/update/:code')
  async updateStudentByCode(
    @Param() param: UpdateStudentByCodeParamDto,
    @Body() body: UpdateStudentByCodeBodyDto,
  ) {
    return await this.studentsService.updateStudentByCode(param, body);
  }

  @Delete('/delete/:code')
  async deleteStudentByCode(@Param() param: DeleteStudentByCodeParamDto) {
    return await this.studentsService.deleteStudentByCode(param);
  }

  @Get('/find')
  async findStudents(@Query() query: FindStudentsQueryDto) {
    return await this.studentsService.findStudents(query);
  }

  @Get('/find/:code')
  async findStudentByCode(@Param() param: FindStudentByCode) {
    return await this.studentsService.findStudentByCode(param);
  }
}
