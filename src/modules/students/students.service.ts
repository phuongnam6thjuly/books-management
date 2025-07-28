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

import sortHelper from 'src/helpers/sort.helper';
import paginationHelper from 'src/helpers/pagination.helper';

import {
  UpdateStudentByCodeBodyDto,
  UpdateStudentByCodeParamDto,
} from './dto/update-student-by-code.dto';
import { FindStudentsQueryDto } from './dto/find-students.dto';
import { CreateStudentBodyDto } from './dto/create-student.dto';
import { Student, StudentSchema } from './schema/student.schema';
import { FindStudentByCode } from './dto/find-student-by-code.dto';
import { EStudentUniversity } from './enums/student-university.enum';
import { DeleteStudentByCodeParamDto } from './dto/delete-student-by-code.dto';

@Injectable()
export class StudentsService {
  private readonly connections = new Map<string, Connection>();

  constructor() {}

  async getConnection(dbName: string) {
    if (this.connections.has(dbName)) {
      return this.connections.get(dbName);
    }

    const uri = `mongodb+srv://tinht5667:0zp98Y7TaQ88jcBS@cluster0.sgcqdmm.mongodb.net/${dbName}?retryWrites=true&w=majority`;
    const conn = await createConnection(uri).asPromise();

    conn.model(Student.name, StudentSchema);

    this.connections.set(dbName, conn);

    return conn;
  }

  async getStudentModel(dbName: string) {
    const conn = await this.getConnection(dbName);
    if (!conn) {
      throw new InternalServerErrorException();
    }

    return conn.model<Student>(Student.name);
  }

  getDbNameFromCode({ code }: { code: string }) {
    const codeFirstLetter = code[0];

    if (codeFirstLetter === 'B') {
      return 'ctu';
    }

    if (codeFirstLetter === 'F') {
      return 'fpt';
    }

    return 'tdu';
  }

  async create({ dbName, doc }: { dbName: string; doc: Student }) {
    const StudentModel = await this.getStudentModel(dbName);

    const student = new StudentModel(doc);
    return await student.save();
  }

  async countDocuments({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Student>;
  }) {
    const StudentModel = await this.getStudentModel(dbName);

    return await StudentModel.countDocuments(filter);
  }

  async find({
    dbName,
    filter,
    sort,
    skip,
    limit,
  }: {
    dbName: string;
    filter: RootFilterQuery<Student>;
    sort?: { [key: string]: SortOrder };
    skip?: number;
    limit?: number;
  }) {
    const StudentModel = await this.getStudentModel(dbName);

    return await StudentModel.find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findOne({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Student>;
  }) {
    const StudentModel = await this.getStudentModel(dbName);

    return await StudentModel.findOne(filter);
  }

  async findOneAndUpdate({
    dbName,
    filter,
    update,
  }: {
    dbName: string;
    filter: RootFilterQuery<Student>;
    update: UpdateQuery<Student>;
  }) {
    const StudentModel = await this.getStudentModel(dbName);

    return await StudentModel.findOneAndUpdate(filter, update);
  }

  async findOneAndDelete({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Student>;
  }) {
    const StudentModel = await this.getStudentModel(dbName);

    return await StudentModel.findOneAndDelete(filter);
  }

  // POST /v1/students/create
  async createStudent(body: CreateStudentBodyDto) {
    const { code, fullName, address, university, major, borrowCount } = body;

    return await this.create({
      dbName: body.university,
      doc: {
        code,
        fullName,
        address,
        university: university as EStudentUniversity,
        major,
        borrowCount,
      },
    });
  }

  // PATCH /v1/students/update/:id
  async updateStudentByCode(
    param: UpdateStudentByCodeParamDto,
    body: UpdateStudentByCodeBodyDto,
  ) {
    const { code } = param;
    const { fullName, address, major, borrowCount } = body;

    const dbName = this.getDbNameFromCode({ code });

    const studentExists = await this.findOneAndUpdate({
      dbName,
      filter: { code },
      update: {
        fullName,
        address,
        major,
        borrowCount,
      },
    });
    if (!studentExists) {
      throw new NotFoundException('Student code not found');
    }

    return studentExists;
  }

  // DELETE /v1/students/delete/:code
  async deleteStudentByCode(param: DeleteStudentByCodeParamDto) {
    const { code } = param;

    const dbName = this.getDbNameFromCode({ code });
    const studentExists = await this.findOneAndDelete({
      dbName,
      filter: { code },
    });
    if (!studentExists) {
      throw new NotFoundException('Student code not found');
    }

    return {};
  }

  // GET /v1/students/find?filter?={university?}&page?&limit?
  async findStudents(query: FindStudentsQueryDto) {
    const { filter, page, limit } = query;

    const filterOptions: {
      university: string;
    } = { university: 'ctu' };
    const pagination = paginationHelper(page, limit);
    let sort = {};

    if (filter) {
      const { university, sortBy, sortOrder } = filter;

      if (university) {
        filterOptions.university = university as string;
      }

      sort = sortHelper(sortBy as string, sortOrder as string);
    }

    const dbName = filterOptions.university;

    const [total, items] = await Promise.all([
      this.countDocuments({ dbName, filter: filterOptions }),
      this.find({
        dbName,
        filter: filterOptions,
        sort,
        skip: pagination.skip,
        limit: pagination.limit,
      }),
    ]);
    return {
      students: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        items,
      },
    };
  }

  // GET /v1/students/find/:code
  async findStudentByCode(param: FindStudentByCode) {
    const { code } = param;

    const dbName = this.getDbNameFromCode({ code });
    const studentExists = await this.findOne({ dbName, filter: { code } });
    if (!studentExists) {
      throw new NotFoundException('Student code not found');
    }

    return studentExists;
  }
}
