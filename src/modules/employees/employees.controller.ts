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
  UpdateEmployeeByCodeBodyDto,
  UpdateEmployeeByCodeParamDto,
} from './dto/update-employee-by-code.dto';
import { EmployeesService } from './employees.service';
import { FindEmployeesQueryDto } from './dto/find-employees.dto';
import { CreateEmployeeBodyDto } from './dto/create-employee.dto';
import { FindEmployeeByCode } from './dto/find-employee-by-code.dto';
import { DeleteEmployeeByCodeParamDto } from './dto/delete-employee-by-code.dto';

@Controller({
  path: '/employees',
  version: '1',
})
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post('/create')
  async createEmployee(@Body() body: CreateEmployeeBodyDto) {
    return await this.employeesService.createEmployee(body);
  }

  @Patch('/update/:code')
  async updateEmployeeByCode(
    @Param() param: UpdateEmployeeByCodeParamDto,
    @Body() body: UpdateEmployeeByCodeBodyDto,
  ) {
    return await this.employeesService.updateEmployeeByCode(param, body);
  }

  @Delete('/delete/:code')
  async deleteEmployeeByCode(@Param() param: DeleteEmployeeByCodeParamDto) {
    return await this.employeesService.deleteEmployeeByCode(param);
  }

  @Get('/find')
  async findEmployees(@Query() query: FindEmployeesQueryDto) {
    return await this.employeesService.findEmployees(query);
  }

  @Get('/find/:code')
  async findEmployeeByCode(@Param() param: FindEmployeeByCode) {
    return await this.employeesService.findEmployeeByCode(param);
  }
}
