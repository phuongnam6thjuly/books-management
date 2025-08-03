import mongoose, {
  Connection,
  createConnection,
  PopulateOptions,
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

import { AuthorsService } from '../authors/authors.service';

import {
  UpdateBookByCodeBodyDto,
  UpdateBookByCodeParamDto,
} from './dto/update-book-by-code.dto';
import { Book, BookSchema } from './schema/book.schema';
import { FindBooksQueryDto } from './dto/find-books.dto';
import { CreateBookBodyDto } from './dto/create-book.dto';
import { FindBookByCode } from './dto/find-book-by-code.dto';
import { DeleteBookByCodeParamDto } from './dto/delete-book-by-code.dto';

@Injectable()
export class BooksService {
  private readonly connections = new Map<string, Connection>();

  constructor(private readonly authorsService: AuthorsService) {}

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

    conn.model(Book.name, BookSchema);

    this.connections.set(dbName, conn);

    return conn;
  }

  async getBookModel(dbName: string) {
    const conn = await this.getConnection(dbName);
    if (!conn) {
      throw new InternalServerErrorException();
    }

    return conn.model<Book>(Book.name);
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

  async create({ dbName, doc }: { dbName: string; doc: Book }) {
    const BookModel = await this.getBookModel(dbName);

    const book = new BookModel(doc);
    return await book.save();
  }

  async countDocuments({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Book>;
  }) {
    const BookModel = await this.getBookModel(dbName);

    return await BookModel.countDocuments(filter);
  }

  async find({
    dbName,
    filter,
    sort,
    skip,
    limit,
    populate,
  }: {
    dbName: string;
    filter: RootFilterQuery<Book>;
    sort?: { [key: string]: SortOrder };
    skip?: number;
    limit?: number;
    populate?: PopulateOptions | (string | PopulateOptions)[];
  }) {
    const BookModel = await this.getBookModel(dbName);

    return await BookModel.find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20)
      .populate(populate || []);
  }

  async findOne({
    dbName,
    filter,
    populate,
  }: {
    dbName: string;
    filter: RootFilterQuery<Book>;
    populate?: PopulateOptions | (string | PopulateOptions)[];
  }) {
    const BookModel = await this.getBookModel(dbName);

    return await BookModel.findOne(filter).populate(populate || []);
  }

  async findOneAndUpdate({
    dbName,
    filter,
    update,
  }: {
    dbName: string;
    filter: RootFilterQuery<Book>;
    update: UpdateQuery<Book>;
  }) {
    const BookModel = await this.getBookModel(dbName);

    return await BookModel.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    });
  }

  async findOneAndDelete({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Book>;
  }) {
    const BookModel = await this.getBookModel(dbName);

    return await BookModel.findOneAndDelete(filter);
  }

  // POST /v1/books/create
  async createBook(body: CreateBookBodyDto) {
    const { code, title, publisher, year, type, quantity, site, authorId } =
      body;

    const dbName = this.getDbNameFromCode({ code });

    const authorExists = await this.authorsService.findOne({
      dbName: 'universities',
      filter: { _id: authorId },
    });
    if (!authorExists) {
      throw new NotFoundException('Author id not found');
    }

    await this.create({
      dbName: 'universities',
      doc: {
        code,
        title,
        publisher,
        year,
        type,
        quantity,
        site,
        authorId: new mongoose.Types.ObjectId(authorId),
      },
    });
    return await this.create({
      dbName,
      doc: {
        code,
        title,
        publisher,
        year,
        type,
        quantity,
        site,
        authorId: new mongoose.Types.ObjectId(authorId),
      },
    });
  }

  // PATCH /v1/books/update/:id
  async updateBookByCode(
    param: UpdateBookByCodeParamDto,
    body: UpdateBookByCodeBodyDto,
  ) {
    const { code } = param;
    const { title, publisher, year, type, quantity } = body;

    const dbName = this.getDbNameFromCode({ code });

    const bookExists = await this.findOneAndUpdate({
      dbName,
      filter: { code },
      update: {
        title,
        publisher,
        year,
        type,
        quantity,
      },
    });
    if (!bookExists) {
      throw new NotFoundException('Book code not found');
    }
    await this.findOneAndUpdate({
      dbName: 'universities',
      filter: { code },
      update: {
        title,
        publisher,
        year,
        type,
        quantity,
      },
    });

    return bookExists;
  }

  // DELETE /v1/books/delete/:code
  async deleteBookByCode(param: DeleteBookByCodeParamDto) {
    const { code } = param;

    const dbName = this.getDbNameFromCode({ code });

    const bookExists = await this.findOneAndDelete({
      dbName,
      filter: { code },
    });
    if (!bookExists) {
      throw new NotFoundException('Book code not found');
    }
    await this.findOneAndDelete({
      dbName: 'universities',
      filter: { code },
    });

    return {};
  }

  // GET /v1/books/find?filter?={university?}&page?&limit?
  async findBooks(query: FindBooksQueryDto) {
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
      books: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        items,
      },
    };
  }

  // GET /v1/books/find/:code
  async findBookByCode(param: FindBookByCode) {
    const { code } = param;

    const dbName = this.getDbNameFromCode({ code });
    const bookExists = await this.findOne({
      dbName,
      filter: { code },
    });
    if (!bookExists) {
      throw new NotFoundException('Book code not found');
    }

    return bookExists;
  }
}
