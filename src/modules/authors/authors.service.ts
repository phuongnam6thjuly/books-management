import { RootFilterQuery } from 'mongoose';
import { Connection, createConnection, SortOrder, UpdateQuery } from 'mongoose';

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { Author, AuthorSchema } from './schema/author.schema';
import { CreateAuthorBodyDto } from './dto/create-author.dto';
import {
  UpdateAuthorByCodeBodyDto,
  UpdateAuthorByCodeParamDto,
} from './dto/update-author-by-code.dto';
import { DeleteAuthorByCodeParamDto } from './dto/delete-author-by-code.dto';
import { FindAuthorsQueryDto } from './dto/find-authors.dto';
import paginationHelper from 'src/helpers/pagination.helper';
import sortHelper from 'src/helpers/sort.helper';
import { FindAuthorByCode } from './dto/find-author-by-code.dto';

@Injectable()
export class AuthorsService {
  private readonly dbName = 'ctu';
  private readonly connections = new Map<string, Connection>();

  constructor() {}

  async getConnection(dbName: string) {
    if (this.connections.has(dbName)) {
      return this.connections.get(dbName);
    }

    const uri = `mongodb+srv://tinht5667:0zp98Y7TaQ88jcBS@cluster0.sgcqdmm.mongodb.net/${dbName}?retryWrites=true&w=majority`;
    const conn = await createConnection(uri).asPromise();

    conn.model(Author.name, AuthorSchema);

    this.connections.set(dbName, conn);

    return conn;
  }

  async getAuthorModel(dbName: string) {
    const conn = await this.getConnection(dbName);
    if (!conn) {
      throw new InternalServerErrorException();
    }

    return conn.model<Author>(Author.name);
  }

  async create({ dbName, doc }: { dbName: string; doc: Author }) {
    const AuthorModel = await this.getAuthorModel(dbName);

    const author = new AuthorModel(doc);
    return await author.save();
  }

  async countDocuments({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Author>;
  }) {
    const AuthorModel = await this.getAuthorModel(dbName);

    return await AuthorModel.countDocuments(filter);
  }

  async find({
    dbName,
    filter,
    sort,
    skip,
    limit,
  }: {
    dbName: string;
    filter: RootFilterQuery<Author>;
    sort?: { [key: string]: SortOrder };
    skip?: number;
    limit?: number;
  }) {
    const AuthorModel = await this.getAuthorModel(dbName);

    return await AuthorModel.find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findOne({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Author>;
  }) {
    const AuthorModel = await this.getAuthorModel(dbName);

    return await AuthorModel.findOne(filter);
  }

  async findOneAndUpdate({
    dbName,
    filter,
    update,
  }: {
    dbName: string;
    filter: RootFilterQuery<Author>;
    update: UpdateQuery<Author>;
  }) {
    const AuthorModel = await this.getAuthorModel(dbName);

    return await AuthorModel.findOneAndUpdate(filter, update);
  }

  async findOneAndDelete({
    dbName,
    filter,
  }: {
    dbName: string;
    filter: RootFilterQuery<Author>;
  }) {
    const AuthorModel = await this.getAuthorModel(dbName);

    return await AuthorModel.findOneAndDelete(filter);
  }

  // POST /v1/authors/create
  async createAuthor(body: CreateAuthorBodyDto) {
    const { code, fullName } = body;

    return await this.create({
      dbName: this.dbName,
      doc: {
        code,
        fullName,
      },
    });
  }

  // PATCH /v1/authors/update/:id
  async updateAuthorByCode(
    param: UpdateAuthorByCodeParamDto,
    body: UpdateAuthorByCodeBodyDto,
  ) {
    const { code } = param;
    const { fullName } = body;

    const authorExists = await this.findOneAndUpdate({
      dbName: this.dbName,
      filter: { code },
      update: {
        fullName,
      },
    });
    if (!authorExists) {
      throw new NotFoundException('Author code not found');
    }

    return authorExists;
  }

  // DELETE /v1/authors/delete/:code
  async deleteAuthorByCode(param: DeleteAuthorByCodeParamDto) {
    const { code } = param;

    const authorExists = await this.findOneAndDelete({
      dbName: this.dbName,
      filter: { code },
    });
    if (!authorExists) {
      throw new NotFoundException('Author code not found');
    }

    return {};
  }

  // GET /v1/authors/find?filter?={}&page?&limit?
  async findAuthors(query: FindAuthorsQueryDto) {
    const { filter, page, limit } = query;

    const filterOptions = {};
    const pagination = paginationHelper(page, limit);
    let sort = {};

    if (filter) {
      const { sortBy, sortOrder } = filter;

      sort = sortHelper(sortBy as string, sortOrder as string);
    }

    const [total, items] = await Promise.all([
      this.countDocuments({ dbName: this.dbName, filter: filterOptions }),
      this.find({
        dbName: this.dbName,
        filter: filterOptions,
        sort,
        skip: pagination.skip,
        limit: pagination.limit,
      }),
    ]);
    return {
      authors: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        items,
      },
    };
  }

  // GET /v1/authors/find/:code
  async findAuthorByCode(param: FindAuthorByCode) {
    const { code } = param;

    const authorExists = await this.findOne({
      dbName: this.dbName,
      filter: { code },
    });
    if (!authorExists) {
      throw new NotFoundException('Author code not found');
    }

    return authorExists;
  }
}
