import {
  Connection,
  createConnection,
  RootFilterQuery,
  SortOrder,
  UpdateQuery,
} from 'mongoose';

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import {
  MONGO_CTU_URL,
  MONGO_FPT_URL,
  MONGO_TDU_URL,
  MONGO_UNIVERSITY_URL,
} from 'src/constants/database.constant';
import sortHelper from 'src/helpers/sort.helper';
import paginationHelper from 'src/helpers/pagination.helper';

import {
  UpdateEmployeeByCodeBodyDto,
  UpdateEmployeeByCodeParamDto,
} from './dto/update-employee-by-code.dto';
import { FindEmployeesQueryDto } from './dto/find-employees.dto';
import { CreateEmployeeBodyDto } from './dto/create-employee.dto';
import { Employee, EmployeeSchema } from './schema/employee.schema';
import { FindEmployeeByCode } from './dto/find-employee-by-code.dto';
import { DeleteEmployeeByCodeParamDto } from './dto/delete-employee-by-code.dto';

@Injectable()
export class EmployeesService {
  private readonly connections = new Map<string, Connection>();

  constructor() {}

  async getConnection(dbName: string) {
    if (this.connections.has(dbName)) {
      return this.connections.get(dbName);
    }

    let uri = '';
    if (dbName === 'ctu') {
      uri = MONGO_CTU_URL;
    } else if (dbName === 'fpt') {
      uri = MONGO_FPT_URL;
    } else if (dbName === 'tdu') {
      uri = MONGO_TDU_URL;
    } else {
      uri = MONGO_UNIVERSITY_URL;
    }
    const conn = await createConnection(uri).asPromise();

    conn.model(Employee.name, EmployeeSchema);

    this.connections.set(dbName, conn);

    return conn;
  }

  async getEmployeeModel(dbName: string) {
    const conn = await this.getConnection(dbName);
    if (!conn) {
      throw new InternalServerErrorException();
    }

    return conn.model<Employee>(Employee.name);
  }

  getDbNameFromCode({ code }: { code: string }) {
    const codeFirstLetter = code[0];

    if (codeFirstLetter === 'B') {
      return 'ctu';
    }

    if (codeFirstLetter === 'F') {
      return 'fpt';
    }

    if (codeFirstLetter === 'T') {
      return 'tdu';
    }

    return 'universities';
  }

  async create({ dbName, doc }: { dbName: string; doc: Employee }) {
    const EmployeeModel = await this.getEmployeeModel(dbName);

    const employee = new EmployeeModel(doc);
    return await employee.save();
  }

  async countDocuments({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Employee>;
  }) {
    const EmployeeModel = await this.getEmployeeModel(dbName);

    return await EmployeeModel.countDocuments(filter);
  }

  async find({
    dbName,
    filter,
    sort,
    skip,
    limit,
  }: {
    dbName: string;
    filter: RootFilterQuery<Employee>;
    sort?: { [key: string]: SortOrder };
    skip?: number;
    limit?: number;
  }) {
    const EmployeeModel = await this.getEmployeeModel(dbName);

    return await EmployeeModel.find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findOne({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Employee>;
  }) {
    const EmployeeModel = await this.getEmployeeModel(dbName);

    return await EmployeeModel.findOne(filter);
  }

  async findOneAndUpdate({
    dbName,
    filter,
    update,
  }: {
    dbName: string;
    filter: RootFilterQuery<Employee>;
    update: UpdateQuery<Employee>;
  }) {
    const EmployeeModel = await this.getEmployeeModel(dbName);

    return await EmployeeModel.findOneAndUpdate(filter, update);
  }

  async findOneAndDelete({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Employee>;
  }) {
    const EmployeeModel = await this.getEmployeeModel(dbName);

    return await EmployeeModel.findOneAndDelete(filter);
  }

  // POST /v1/employees/create
  async createEmployee(body: CreateEmployeeBodyDto) {
    const { code, fullName, address, status, lib } = body;

    const dbName = this.getDbNameFromCode({ code });

    await this.create({
      dbName: 'universities',
      doc: {
        code,
        fullName,
        address,
        status,
        lib,
      },
    });
    return await this.create({
      dbName,
      doc: {
        code,
        fullName,
        address,
        status,
        lib,
      },
    });
  }

  // PATCH /v1/employees/update/:id
  async updateEmployeeByCode(
    param: UpdateEmployeeByCodeParamDto,
    body: UpdateEmployeeByCodeBodyDto,
  ) {
    const { code } = param;
    const { fullName, address, status } = body;

    const dbName = this.getDbNameFromCode({ code });

    const employeeExists = await this.findOneAndUpdate({
      dbName,
      filter: { code },
      update: {
        fullName,
        address,
        status,
      },
    });
    if (!employeeExists) {
      throw new NotFoundException('Employee code not found');
    }
    await this.findOneAndUpdate({
      dbName: 'universities',
      filter: { code },
      update: {
        fullName,
        address,
        status,
      },
    });

    return employeeExists;
  }

  // DELETE /v1/employees/delete/:code
  async deleteEmployeeByCode(param: DeleteEmployeeByCodeParamDto) {
    const { code } = param;

    const dbName = this.getDbNameFromCode({ code });
    const employeeExists = await this.findOneAndDelete({
      dbName,
      filter: { code },
    });
    if (!employeeExists) {
      throw new NotFoundException('Employee code not found');
    }
    await this.findOneAndDelete({
      dbName: 'universities',
      filter: { code },
    });

    return {};
  }

  // GET /v1/employees/find?filter?={university?}&page?&limit?
  async findEmployees(query: FindEmployeesQueryDto) {
    const { filter, page, limit } = query;

    const filterOptions: {
      university: string;
    } = { university: '' };
    const pagination = paginationHelper(page, limit);
    let sort = {};

    if (filter) {
      const { university, sortBy, sortOrder } = filter;

      if (university) {
        filterOptions.university = university as string;
      }

      sort = sortHelper(sortBy as string, sortOrder as string);
    }

    const dbName = filterOptions.university || 'universities';

    const [total, items] = await Promise.all([
      this.countDocuments({ dbName, filter: {} }),
      this.find({
        dbName,
        filter: {},
        sort,
        skip: pagination.skip,
        limit: pagination.limit,
      }),
    ]);
    return {
      employees: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        items,
      },
    };
  }

  // GET /v1/employees/find/:code
  async findEmployeeByCode(param: FindEmployeeByCode) {
    const { code } = param;

    const dbName = this.getDbNameFromCode({ code });
    const employeeExists = await this.findOne({ dbName, filter: { code } });
    if (!employeeExists) {
      throw new NotFoundException('Employee code not found');
    }

    return employeeExists;
  }
}
