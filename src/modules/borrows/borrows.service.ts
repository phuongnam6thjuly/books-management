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

import { FindBorrowsQueryDto } from './dto/find-borrows.dto';
import { Borrow, BorrowSchema } from './schema/borrow.schema';
import { CreateBorrowBodyDto } from './dto/create-borrow.dto';
import { FindBorrowByCode } from './dto/find-borrow-by-code.dto';

@Injectable()
export class BorrowsService {
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

    conn.model(Borrow.name, BorrowSchema);

    this.connections.set(dbName, conn);

    return conn;
  }

  async getBorrowModel(dbName: string) {
    const conn = await this.getConnection(dbName);
    if (!conn) {
      throw new InternalServerErrorException();
    }

    return conn.model<Borrow>(Borrow.name);
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

  async create({ dbName, doc }: { dbName: string; doc: Borrow }) {
    const BorrowModel = await this.getBorrowModel(dbName);

    const borrow = new BorrowModel(doc);
    return await borrow.save();
  }

  async countDocuments({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Borrow>;
  }) {
    const BorrowModel = await this.getBorrowModel(dbName);

    return await BorrowModel.countDocuments(filter);
  }

  async find({
    dbName,
    filter,
    sort,
    skip,
    limit,
  }: {
    dbName: string;
    filter: RootFilterQuery<Borrow>;
    sort?: { [key: string]: SortOrder };
    skip?: number;
    limit?: number;
  }) {
    const BorrowModel = await this.getBorrowModel(dbName);

    return await BorrowModel.find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findOne({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Borrow>;
  }) {
    const BorrowModel = await this.getBorrowModel(dbName);

    return await BorrowModel.findOne(filter);
  }

  async findOneAndUpdate({
    dbName,
    filter,
    update,
  }: {
    dbName: string;
    filter: RootFilterQuery<Borrow>;
    update: UpdateQuery<Borrow>;
  }) {
    const BorrowModel = await this.getBorrowModel(dbName);

    return await BorrowModel.findOneAndUpdate(filter, update);
  }

  async findOneAndDelete({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Borrow>;
  }) {
    const BorrowModel = await this.getBorrowModel(dbName);

    return await BorrowModel.findOneAndDelete(filter);
  }

  // POST /v1/borrows/create
  async createBorrow(body: CreateBorrowBodyDto) {
    const { bookCode, studentCode, borrowDate, returnDate } = body;

    const dbName = this.getDbNameFromCode({ code: bookCode });

    await this.create({
      dbName: 'universities',
      doc: {
        bookCode,
        studentCode,
        borrowDate,
        returnDate,
      },
    });
    return await this.create({
      dbName,
      doc: {
        bookCode,
        studentCode,
        borrowDate,
        returnDate,
      },
    });
  }

  // GET /v1/borrows/find?filter?={university?}&page?&limit?
  async findBorrows(query: FindBorrowsQueryDto) {
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
      borrows: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        items,
      },
    };
  }

  // GET /v1/borrows/find/:code
  async findBorrowByCode(param: FindBorrowByCode) {
    const { bookCode, studentCode } = param;

    const dbName = this.getDbNameFromCode({ code: studentCode });
    const borrowExists = await this.findOne({
      dbName,
      filter: { bookCode, studentCode },
    });
    if (!borrowExists) {
      throw new NotFoundException('Borrow code not found');
    }

    return borrowExists;
  }
}
